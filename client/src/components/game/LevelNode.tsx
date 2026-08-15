import { Circle, Group, Line, Text, Rect } from 'react-konva'

type LevelStatus = 'locked' | 'available' | 'completed'

interface LabelConfig {
  side: 'left' | 'right'
  gap: number
  vOffset: number
}

// 节点半径
export const NODE_R = 14

// 标签偏移配置 — vOffset 均非零，确保引线直角拐弯不重叠路线
const LABEL_CONFIG: Record<number, LabelConfig> = {
  1:  { side: 'right', gap: 38, vOffset: -20 },   // 瑞金
  2:  { side: 'right', gap: 38, vOffset: 20 },   // 湘江
  3:  { side: 'right', gap: 40, vOffset: -32 },   // 遵义 — 下移5px
  4:  { side: 'right', gap: 40, vOffset: -20 },   // 赤水 — 改右侧，避金沙江
  5:  { side: 'left',  gap: 44, vOffset: 20 },    // 金沙江
  6:  { side: 'left',  gap: 46, vOffset: 20 },    // 泸定桥
  7:  { side: 'left',  gap: 44, vOffset: -20 },   // 雪山 — 向上拐，避泸定桥
  8:  { side: 'left',  gap: 44, vOffset: -30 },   // 草地 — 上移，与雪山分离
  9:  { side: 'left',  gap: 44, vOffset: -35 },   // 腊子口 — 改左，避路线穿过标签框
  10: { side: 'right', gap: 46, vOffset: -20 },   // 吴起镇
}

// ====================================================================
//  LevelNode
// ====================================================================

interface LevelNodeProps {
  x: number
  y: number
  levelId: number
  label: string
  shortDesc: string
  status: LevelStatus
  stars: number
  isSelected: boolean
  onClick: () => void
}

export default function LevelNode({
  x, y, levelId, label, shortDesc, status, stars, isSelected, onClick,
}: LevelNodeProps) {
  const isLocked = status === 'locked'
  const isCompleted = status === 'completed'
  const r = NODE_R

  let fillColor: string
  let strokeColor: string
  let highlightColor: string
  let numberColor: string

  if (isLocked) {
    fillColor = '#7d7d7d'
    strokeColor = '#4a4a4a'
    highlightColor = '#9e9e9e'
    numberColor = '#b0b0b0'
  } else if (isCompleted) {
    fillColor = '#2e7d32'
    strokeColor = '#1b5e20'
    highlightColor = '#4caf50'
    numberColor = '#ffffff'
  } else {
    fillColor = '#f9a825'
    strokeColor = '#e65100'
    highlightColor = '#ffcc02'
    numberColor = '#ffffff'
  }

  return (
    <Group>
      {/* 底部阴影 */}
      <Circle x={x + 3} y={y + 3} radius={r}
        fill="rgba(0,0,0,0.35)" listening={false} perfectDrawEnabled={false} />

      {/* 主圆 */}
      <Circle x={x} y={y} radius={r}
        fill={fillColor}
        stroke={strokeColor} strokeWidth={2.5}
        onClick={onClick} onTap={onClick}
        perfectDrawEnabled={false}
      />

      {/* 内圈高光 */}
      <Circle x={x} y={y - r * 0.15} radius={r * 0.58}
        fill={highlightColor} opacity={0.28} listening={false} perfectDrawEnabled={false} />

      {/* 关卡编号 */}
      <Text x={x - 8} y={y - 7} width={16}
        text={String(levelId)}
        fontSize={12} fontFamily="Arial, sans-serif"
        fontStyle="bold" fill={numberColor} align="center"
        listening={false} />

      {/* 锁定图标 */}
      {isLocked && <LockIcon x={x} y={y} />}

      {/* 通关星级 — 节点下方 */}
      {isCompleted && <StarsBelow x={x} y={y + r + 4} stars={stars} />}

      {/* 选中卡片 */}
      {isSelected && !isLocked && (
        <Group
          x={clamp(x - 120, 8, 802 - 240 - 8)}
          y={clamp(y + r + 28, 8, 433 - 60)}
          listening={false}
        >
          <Rect width={240} height={56} cornerRadius={8}
            fill="rgba(18,8,4,0.95)" stroke="rgba(240,214,138,0.4)" strokeWidth={1.2}
            shadowColor="rgba(0,0,0,0.6)" shadowBlur={10} />
          <Text x={12} y={6} width={216} text={label}
            fontSize={13} fontFamily="serif" fontStyle="bold" fill="#f0d68a" />
          <Text x={12} y={28} width={216} text={shortDesc}
            fontSize={10} fontFamily="serif" fill="#d4b896" lineHeight={1.3} />
        </Group>
      )}
    </Group>
  )
}

// ====================================================================
//  锁图标（适配 14px 半径）
// ====================================================================

function LockIcon({ x, y }: { x: number; y: number }) {
  return (
    <Group x={x} y={y - 0.5} listening={false}>
      {/* 锁梁 */}
      <Line
        points={[-4.5, 0, -4.5, -5.5, 4.5, -5.5, 4.5, 0]}
        stroke="#d5d5d5" strokeWidth={2.8}
        lineCap="round" lineJoin="round"
      />
      {/* 锁体 */}
      <Rect x={-6} y={0.5} width={12} height={8} cornerRadius={2}
        fill="#e8e8e8" stroke="#aaaaaa" strokeWidth={1.2} />
      {/* 锁体高光 */}
      <Rect x={-3.5} y={1.5} width={3.5} height={3.5} cornerRadius={1}
        fill="rgba(255,255,255,0.35)" />
      {/* 钥匙孔 */}
      <Circle x={0} y={4} radius={1.2} fill="#424242" />
      <Rect x={-0.5} y={4} width={1} height={2.5} cornerRadius={0.5} fill="#424242" />
    </Group>
  )
}

// ====================================================================
//  通关星级
// ====================================================================

function StarsBelow({ x, y, stars }: { x: number; y: number; stars: number }) {
  return (
    <Group x={x} y={y} listening={false}>
      {[0, 1, 2].map((i) => (
        <Text key={i}
          x={-18 + i * 18}
          y={0}
          text={i < stars ? '★' : '☆'}
          fontSize={14}
          fontFamily="serif"
          fill={i < stars ? '#ffd700' : '#558b2f'}
          listening={false}
        />
      ))}
    </Group>
  )
}

// ====================================================================
//  NodeLabel — 引线直角拐弯 + 气泡标签，干净无箭头
// ====================================================================

export function NodeLabel({ x, y, text, stationId }: {
  x: number; y: number; text: string; stationId: number
}) {
  const cfg = LABEL_CONFIG[stationId] || { side: 'right', gap: 44, vOffset: -16 }
  const dir = cfg.side === 'right' ? 1 : -1
  const isRight = cfg.side === 'right'

  // 引线延长线过圆心：垂直段起点取圆边缘（与圆心同一竖线）
  const armEndX = x + dir * (NODE_R + cfg.gap)
  const labelY = y + cfg.vOffset
  const armStartY = labelY < y ? y - NODE_R : y + NODE_R

  const padX = 7
  const padY = 3
  const fontSize = 11
  const estW = text.length * fontSize + padX * 2
  const estH = fontSize + padY * 2

  const boxX = isRight ? armEndX + 4 : armEndX - 4 - estW
  const boxY = labelY - estH / 2

  return (
    <Group listening={false}>
      {/* 垂直段：从圆边缘（延长线过圆心）到拐点 */}
      <Line points={[x, armStartY, x, labelY]}
        stroke="#8b7355" strokeWidth={1} opacity={0.45} lineCap="round" />

      {/* 水平段：从圆心x到标签框 */}
      <Line points={[x, labelY, armEndX, labelY]}
        stroke="#8b7355" strokeWidth={1} opacity={0.45} lineCap="round" />

      {/* 气泡框 */}
      <Rect x={boxX} y={boxY} width={estW} height={estH} cornerRadius={4}
        fill="rgba(20,10,5,0.9)" stroke="rgba(160,120,80,0.32)" strokeWidth={0.8} />

      {/* 标签文字 */}
      <Text x={boxX + padX} y={boxY + padY} width={estW - padX * 2} text={text}
        fontSize={fontSize} fontFamily="serif" fontStyle="bold"
        fill="#d4b896" align="center" verticalAlign="middle" />
    </Group>
  )
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(v, hi))
}
