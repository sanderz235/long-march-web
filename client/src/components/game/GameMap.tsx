import { useState, useEffect, useRef, useMemo, useLayoutEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stage, Layer, Line, Group, Text, Rect, Image as KonvaImage } from 'react-konva'
import useGameStore from '../../store/gameStore'
import { LEVELS } from '../../data/levels'
import { STATION_COORDS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../data/mapData'
import PlayerSprite from './PlayerSprite'
import LevelNode, { NodeLabel } from './LevelNode'

/** 调试模式 */
function isDebugMode(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get('debug') === '1') return true
    if (localStorage.getItem('debug_mode') === 'true') return true
  } catch { /* ignore */ }
  return false
}

export default function GameMap() {
  const { currentLevel, playerStationId, getLevelStatus, getStars, dismissCompletionNotice } = useGameStore()
  const navigate = useNavigate()
  const [selectedNode, setSelectedNode] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debugMode = useMemo(() => isDebugMode(), [])
  const [debugPanel, setDebugPanel] = useState(false)

  // 锁定节点点击 → 弹出信息卡
  const [lockedInfo, setLockedInfo] = useState<{ label: string; shortDesc: string } | null>(null)

  const [remountKey, setRemountKey] = useState(0)

  // 静态底图
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setBgImage(img)
    img.src = '/map_bg.svg'
  }, [remountKey])

  // 初始化尺寸
  const [dimensions, setDimensions] = useState({ w: CANVAS_WIDTH, h: CANVAS_HEIGHT })
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    if (width > 0 && height > 0) setDimensions({ w: width, h: height })
  }, [remountKey])

  // ResizeObserver
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) setDimensions({ w: width, h: height })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 玩家位置
  const [playerPos, setPlayerPos] = useState(() => ({
    x: STATION_COORDS[playerStationId - 1]?.x ?? STATION_COORDS[0].x,
    y: (STATION_COORDS[playerStationId - 1]?.y ?? STATION_COORDS[0].y) - 25,
  }))
  const [isWalking, setIsWalking] = useState(false)
  const animating = useRef(false)
  const walkRafRef = useRef(0)
  const [walkedUpTo, setWalkedUpTo] = useState(playerStationId)
  const [walkTarget, setWalkTarget] = useState<number | null>(null)

  useEffect(() => {
    return () => cancelAnimationFrame(walkRafRef.current)
  }, [])

  // ======== 挂载时：通关后走到下一关 ========
  useEffect(() => {
    const completedId = useGameStore.getState().lastCompletedLevel
    const nextId = completedId !== null ? completedId + 1 : null
    if (nextId !== null && nextId <= 10 && nextId > playerStationId) {
      dismissCompletionNotice()
      setWalkTarget(nextId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // walkTarget 变化 → 行走
  useEffect(() => {
    if (animating.current || walkTarget === null) return
    doWalk(playerStationId, walkTarget, true)
  }, [walkTarget])

  const doWalk = useCallback((fromId: number, toId: number, updateStoreOnDone: boolean) => {
    const stations: { id: number; x: number; y: number }[] = []
    for (let i = Math.max(1, fromId); i <= toId; i++) {
      const s = STATION_COORDS[i - 1]
      if (s) stations.push({ id: i, x: s.x, y: s.y - 25 })
    }
    if (stations.length < 2) { setWalkTarget(null); return }
    animating.current = true
    setIsWalking(true)
    walkPath(stations, (reachedId) => { setWalkedUpTo(reachedId) }, () => {
      setIsWalking(false)
      animating.current = false
      setWalkTarget(null)
      if (updateStoreOnDone) useGameStore.getState().setPlayerStation(toId)
    })
  }, [])

  const walkPath = useCallback((
    stations: { id: number; x: number; y: number }[],
    onSegmentDone: (stationId: number) => void,
    done: () => void,
  ) => {
    let idx = 0
    const SPEED = 80
    const goNext = () => {
      if (idx >= stations.length - 1) { done(); return }
      const from = stations[idx]
      const to = stations[idx + 1]
      const dx = to.x - from.x; const dy = to.y - from.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const dur = Math.max(dist / SPEED, 0.3) * 1000
      const startTime = performance.now()
      const animate = (now: number) => {
        const elapsed = now - startTime
        const raw = Math.min(elapsed / dur, 1)
        const t = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw
        setPlayerPos({ x: from.x + dx * t, y: from.y + dy * t })
        if (raw < 1) { walkRafRef.current = requestAnimationFrame(animate) }
        else {
          idx++; onSegmentDone(to.id)
          if (idx >= stations.length - 1) { setPlayerPos({ x: to.x, y: to.y }); done() }
          else goNext()
        }
      }
      walkRafRef.current = requestAnimationFrame(animate)
    }
    goNext()
  }, [])

  // ======== 节点点击 ========
  const handleNodeClick = (levelId: number) => {
    const status = getLevelStatus(levelId)
    const level = LEVELS.find((l) => l.id === levelId)!
    setSelectedNode(levelId)

    // debug 模式：不拦截
    if (!debugMode && status === 'locked') {
      setLockedInfo({ label: level.mapLabel, shortDesc: level.shortDesc })
      return
    }
    navigate(`/level/${levelId}`)
  }

  // ======== Debug: 原子化跳关 ========
  const handleDebugJump = useCallback((toLevel: number) => {
    const progress: Array<{ levelId: number; stars: number }> = []
    for (let i = 1; i < toLevel; i++) {
      progress.push({ levelId: i, stars: 3 })
    }
    useGameStore.setState({
      progress,
      currentLevel: toLevel,
      playerStationId: Math.max(1, toLevel - 1),
      lastCompletedLevel: null,
    })
    setDebugPanel(false)
    setRemountKey(k => k + 1)
  }, [])

  const scaleX = dimensions.w / CANVAS_WIDTH
  const scaleY = dimensions.h / CANVAS_HEIGHT

  return (
    <div key={remountKey} ref={containerRef} className="h-full w-full relative" style={{ background: '#120a05' }}>
      <Stage width={dimensions.w} height={dimensions.h} scaleX={scaleX} scaleY={scaleY}>
        {/* 静态底图 */}
        <Layer>
          {bgImage && (
            <KonvaImage image={bgImage} x={0} y={0}
              width={CANVAS_WIDTH} height={CANVAS_HEIGHT} listening={false} />
          )}
        </Layer>

        {/* 路线层 */}
        <Layer>
          <RouteLine walkedUpTo={walkedUpTo} />
        </Layer>

        {/* 节点 + 标签层 */}
        <Layer>
          {STATION_COORDS.map((coord) => {
            const level = LEVELS.find((l) => l.id === coord.id)!
            const rawStatus = getLevelStatus(coord.id)
            // debug 模式下所有关卡可操作
            const status = debugMode && rawStatus === 'locked' ? 'available' as const : rawStatus
            const stars = getStars(coord.id)
            return (
              <LevelNode
                key={`node-${coord.id}`}
                x={coord.x} y={coord.y}
                levelId={coord.id}
                label={level.mapLabel}
                shortDesc={level.shortDesc}
                status={status} stars={stars}
                isSelected={selectedNode === coord.id}
                onClick={() => handleNodeClick(coord.id)}
              />
            )
          })}
          {/* 引线 + 气泡标签 */}
          {STATION_COORDS.map((coord) => {
            const level = LEVELS.find((l) => l.id === coord.id)!
            return (
              <NodeLabel
                key={`label-${coord.id}`}
                x={coord.x} y={coord.y}
                text={level.mapLabel}
                stationId={coord.id}
              />
            )
          })}
        </Layer>

        {/* 小人 */}
        <Layer>
          <PlayerSprite x={playerPos.x} y={playerPos.y} isWalking={isWalking} />
        </Layer>

        {/* 顶部装饰 */}
        <Layer>
          <TopDecorations currentLevel={currentLevel} />
        </Layer>
      </Stage>

      {/* ======== 锁定节点信息卡（React 悬浮窗） ======== */}
      {lockedInfo && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center"
          style={{ background: 'rgba(10,5,2,0.7)' }}
          onClick={() => setLockedInfo(null)}
        >
          <div
            className="relative p-8 rounded-xl text-center"
            style={{
              background: 'linear-gradient(180deg, rgba(35,20,12,0.98) 0%, rgba(15,6,2,0.98) 100%)',
              border: '2px solid rgba(200,160,60,0.4)',
              boxShadow: '0 12px 60px rgba(0,0,0,0.7)',
              maxWidth: '440px',
              width: '88%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ✕ 关闭按钮 */}
            <button
              onClick={() => setLockedInfo(null)}
              className="absolute top-3 right-4 text-xl leading-none transition-opacity hover:opacity-60"
              style={{ color: '#8b7355', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>

            {/* 大锁图标 */}
            <div className="mb-3" style={{ fontSize: 48, lineHeight: 1 }}>🔒</div>

            <h3 className="mb-2 text-2xl font-bold tracking-widest"
              style={{ color: '#f0d68a', fontFamily: 'serif' }}>
              {lockedInfo.label}
            </h3>
            <p className="mb-5 text-base font-bold tracking-wide"
              style={{ color: '#c41e3a', fontFamily: 'serif' }}>
              — 待解锁 —
            </p>
            <p className="text-base leading-relaxed px-2"
              style={{ color: '#d4b896', fontFamily: 'serif', textWrap: 'balance' }}>
              {lockedInfo.shortDesc}
            </p>
            <p className="mt-6 text-sm"
              style={{ color: '#8b7355', fontFamily: 'serif' }}>
              请先完成前面的关卡
            </p>
          </div>
        </div>
      )}

      {/* ======== 调试面板 ======== */}
      {debugMode && (
        <div className="absolute bottom-4 right-4 z-50">
          <button
            onClick={() => setDebugPanel(!debugPanel)}
            className="px-3 py-1 text-xs rounded transition-opacity hover:opacity-80"
            style={{ background: 'rgba(196,30,58,0.85)', color: '#f4e4c1', border: 'none' }}
          >
            {debugPanel ? '关闭调试' : '调试'}
          </button>
          {debugPanel && (
            <div
              className="mt-2 p-3 rounded space-y-1 max-h-72 overflow-y-auto"
              style={{ background: 'rgba(22,12,6,0.95)', border: '1px solid rgba(200,160,60,0.4)' }}
            >
              <p className="text-xs mb-2" style={{ color: '#f0d68a' }}>一键跳关（原子写入，强制重挂）</p>
              {STATION_COORDS.map((s) => (
                <button key={s.id}
                  onClick={() => handleDebugJump(s.id)}
                  className="block w-full text-left px-3 py-1 text-xs rounded transition-colors"
                  style={{ color: '#d4b896', background: 'rgba(255,255,255,0.05)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(196,30,58,0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                >
                  #{s.id} {LEVELS.find(l => l.id === s.id)?.mapLabel || ''}
                </button>
              ))}
              <button
                onClick={() => {
                  localStorage.removeItem('debug_mode')
                  window.location.reload()
                }}
                className="block w-full text-left px-3 py-1 text-xs rounded mt-2 transition-colors"
                style={{ color: '#c41e3a', background: 'rgba(196,30,58,0.1)' }}
              >
                退出调试模式
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ========================= 路线 =========================

function RouteLine({ walkedUpTo }: { walkedUpTo: number }) {
  const allPoints = STATION_COORDS.flatMap((s) => [s.x, s.y])
  const segments = STATION_COORDS.slice(0, -1).map((s, i) => {
    const next = STATION_COORDS[i + 1]
    return { from: s, to: next }
  })

  return (
    <>
      <Line points={allPoints} stroke="#8b7b6b" strokeWidth={3.5}
        opacity={0.3} lineCap="round" />

      {segments.map((seg, i) => {
        if (seg.to.id > walkedUpTo) return null
        return (
          <Line key={`red-${i}`}
            points={[seg.from.x, seg.from.y, seg.to.x, seg.to.y]}
            stroke="#c41e3a" strokeWidth={2.5}
            opacity={0.55} lineCap="round"
          />
        )
      })}

      {segments.map((seg, i) => {
        if (seg.to.id > walkedUpTo) return null
        return (
          <Line key={`dash-${i}`}
            points={[seg.from.x, seg.from.y, seg.to.x, seg.to.y]}
            stroke="#c41e3a" strokeWidth={1.5}
            opacity={0.3} lineCap="round" dash={[5, 10]}
          />
        )
      })}

    </>
  )
}

// ========================= 顶部装饰 =========================

function TopDecorations({ currentLevel }: { currentLevel: number }) {
  const M = 18
  return (
    <>
      {[
        { x: M + 8, y: M + 8, r: 0 },
        { x: CANVAS_WIDTH - M - 8, y: M + 8, r: 90 },
        { x: CANVAS_WIDTH - M - 8, y: CANVAS_HEIGHT - M - 8, r: 180 },
        { x: M + 8, y: CANVAS_HEIGHT - M - 8, r: 270 },
      ].map((c, i) => (
        <Group key={i} x={c.x} y={c.y} rotation={c.r} offsetX={18} offsetY={18}>
          <Line points={[0, 0, 36, 0, 36, 3, 3, 3, 3, 36, 0, 36]}
            closed fill="#b8860b" opacity={0.3} stroke="#8b6914" strokeWidth={0.5} />
        </Group>
      ))}

      <Group x={M + 22} y={M + 14}>
        <Rect x={-10} y={-6} width={140} height={34}
          fill="rgba(244,228,193,0.18)" cornerRadius={4}
          stroke="rgba(160,128,96,0.3)" strokeWidth={1} />
        <Text x={0} y={0} text="长征路线图" fontSize={16} fontFamily="serif"
          fontStyle="bold" fill="#3b2a1a" letterSpacing={4} />
        <Text x={0} y={18} text="1934 — 1936" fontSize={9} fontFamily="serif"
          fill="#8b7355" letterSpacing={2} />
      </Group>

      <Rect x={M + 6} y={CANVAS_HEIGHT - 46}
        width={CANVAS_WIDTH - (M + 6) * 2} height={28}
        fill="rgba(28,14,8,0.75)" cornerRadius={4} />
      <Text x={M + 16} y={CANVAS_HEIGHT - 37}
        text={`当前进度：第 ${currentLevel} / ${LEVELS.length} 关  |  点击关卡节点开始挑战`}
        fontSize={12} fontFamily="serif" fill="#d4b896" />
    </>
  )
}
