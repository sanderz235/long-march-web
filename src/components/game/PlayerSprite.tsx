import { Group, Circle, Line, Rect } from 'react-konva'
import { useEffect, useRef, useState } from 'react'

interface PlayerSpriteProps {
  x: number
  y: number
  isWalking: boolean
}

export default function PlayerSprite({ x, y, isWalking }: PlayerSpriteProps) {
  const [walkFrame, setWalkFrame] = useState(0)
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!isWalking) {
      setWalkFrame(0)
      return
    }
    let frame = 0
    const animate = () => {
      frame++
      setWalkFrame((frame % 8))
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [isWalking])

  const phase = walkFrame / 8
  const bodyBounce = Math.sin(phase * Math.PI * 2) * 2.5
  const leftLegAngle = Math.sin(phase * Math.PI * 2) * 15
  const rightLegAngle = Math.sin(phase * Math.PI * 2 + Math.PI) * 15
  const leftArmAngle = Math.sin(phase * Math.PI * 2 + Math.PI) * 10
  const rightArmAngle = Math.sin(phase * Math.PI * 2) * 10

  return (
    <Group x={x} y={y + bodyBounce}>
      {/* 底部阴影 */}
      <Circle y={18} radius={6} fill="rgba(0,0,0,0.15)" />

      {/* 左腿 */}
      <Group x={-3} y={4} rotation={leftLegAngle}>
        <Rect x={0} y={0} width={4.5} height={9} fill="#3b4a52" cornerRadius={1.5} />
        {/* 绑腿 */}
        <Rect x={0} y={5} width={4.5} height={3} fill="#8b6914" cornerRadius={0.5} />
        {/* 草鞋 */}
        <Rect x={-0.5} y={9} width={5.5} height={2.5} fill="#8b7355" cornerRadius={1} />
      </Group>

      {/* 右腿 */}
      <Group x={3} y={4} rotation={rightLegAngle}>
        <Rect x={-4.5} y={0} width={4.5} height={9} fill="#3b4a52" cornerRadius={1.5} />
        <Rect x={-4.5} y={5} width={4.5} height={3} fill="#8b6914" cornerRadius={0.5} />
        <Rect x={-5} y={9} width={5.5} height={2.5} fill="#8b7355" cornerRadius={1} />
      </Group>

      {/* 身体（灰蓝军装） */}
      <Group y={-8}>
        <Rect x={-6.5} y={0} width={13} height={14} fill="#5c6b73" cornerRadius={2} />
        {/* 腰带 */}
        <Rect x={-6.5} y={9} width={13} height={2.5} fill="#8b6914" cornerRadius={0.5} />
        {/* 衣领 */}
        <Line points={[-3, 0, 0, 3.5, 3, 0]} stroke="#4a555c" strokeWidth={1.5} closed fill="rgba(0,0,0,0.1)" />
        {/* 扣子 */}
        <Circle x={0} y={5} radius={1} fill="#6b5545" />
        <Circle x={0} y={7.5} radius={1} fill="#6b5545" />
      </Group>

      {/* 左臂 */}
      <Group x={-7.5} y={-5.5} rotation={leftArmAngle}>
        <Rect x={0} y={0} width={3.5} height={9} fill="#5c6b73" cornerRadius={1.5} />
        {/* 左手 (肤色) */}
        <Circle x={1.75} y={10} radius={2} fill="#e8c99b" />
      </Group>

      {/* 右臂 */}
      <Group x={7.5} y={-5.5} rotation={rightArmAngle}>
        <Rect x={-3.5} y={0} width={3.5} height={9} fill="#5c6b73" cornerRadius={1.5} />
        {/* 右手 (肤色) */}
        <Circle x={-1.75} y={10} radius={2} fill="#e8c99b" />
      </Group>

      {/* 头部（带脸）—— y=-14.5 使脸部下缘贴合身体顶部（-8），避免头颈分离 */}
      <Group y={-14.5}>
        {/* 脸 */}
        <Circle x={0} y={0} radius={6.5} fill="#e8c99b" />
        {/* 眼睛 */}
        <Circle x={-2.5} y={-1} radius={0.9} fill="#2c1810" />
        <Circle x={2.5} y={-1} radius={0.9} fill="#2c1810" />
        {/* 眉毛 */}
        <Line points={[-4, -2.8, -1.2, -2.8]} stroke="#5a3a28" strokeWidth={0.7} lineCap="round" />
        <Line points={[1.2, -2.8, 4, -2.8]} stroke="#5a3a28" strokeWidth={0.7} lineCap="round" />
        {/* 鼻子 */}
        <Line points={[0, -0.5, -0.6, 1, 0.6, 1]} stroke="#d4a87c" strokeWidth={0.6} lineCap="round" />
        {/* 嘴巴（微笑弧线） */}
        <Line points={[-1.5, 2.5, 0, 3.3, 1.5, 2.5]} stroke="#c47a5a" strokeWidth={0.7} lineCap="round" />
      </Group>

      {/* 帽子（红军八角帽）—— 随头部同步上移，保持帽檐覆盖头顶 */}
      <Group y={-22}>
        {/* 帽子主体 */}
        <Rect x={-7.5} y={0} width={15} height={5.5} fill="#7a6350" cornerRadius={1.5} />
        {/* 帽身 */}
        <Rect x={-8} y={-2.5} width={16} height={4} fill="#5a4638" cornerRadius={2} />
        {/* 帽舌/帽檐 */}
        <Rect x={-10} y={3} width={20} height={3} fill="#3b2a1a" cornerRadius={1} />
        {/* 红五星 */}
        <Line
          points={[
            0, -6, 2, -2.5, 5.5, -2, 3, -0.2, 4, 3,
            0, 1, -4, 3, -3, -0.2, -5.5, -2, -2, -2.5,
          ]}
          closed
          fill="#c41e3a"
          scaleX={0.5}
          scaleY={0.5}
        />
      </Group>

      {/* 步枪（斜背在身后） */}
      <Group y={-10}>
        <Line
          points={[-6, 12, 6, -6]}
          stroke="#4a3520"
          strokeWidth={2}
          lineCap="round"
          tension={0}
        />
        <Rect x={-6} y={11.5} width={3} height={4} fill="#3b2a1a" cornerRadius={0.5} />
        <Rect x={4} y={-7} width={2.5} height={3} fill="#4a3520" cornerRadius={0.5} />
      </Group>
    </Group>
  )
}
