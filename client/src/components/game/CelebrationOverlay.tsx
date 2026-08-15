import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CelebrationOverlayProps {
  visible: boolean
  stars: number
  levelName: string
  onContinue: () => void
  onRetry: () => void
}

export default function CelebrationOverlay({ visible, stars, levelName, onContinue, onRetry }: CelebrationOverlayProps) {
  const [particlesOn, setParticlesOn] = useState(true)

  // 粒子效果在 2.5 秒后停止
  useEffect(() => {
    if (!visible) return
    setParticlesOn(true)
    const t = setTimeout(() => setParticlesOn(false), 2500)
    return () => clearTimeout(t)
  }, [visible])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.75)' }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 14, stiffness: 160, delay: 0.1 }}
            className="text-center p-10 rounded-xl"
            style={{
              background: 'linear-gradient(180deg, rgba(59,42,26,0.96) 0%, rgba(30,20,10,0.96) 100%)',
              border: '2px solid rgba(240,214,138,0.5)',
              boxShadow: '0 0 60px rgba(212,168,67,0.2)',
            }}
          >
            <h2
              className="text-3xl font-bold mb-2"
              style={{ color: '#f0d68a', fontFamily: 'serif' }}
            >
              恭喜通关！
            </h2>
            <p className="text-lg mb-6" style={{ color: '#d4b896' }}>
              {levelName}
            </p>

            {/* 星星 */}
            <div className="flex justify-center gap-3 mb-4">
              {[1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, rotateY: 180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ delay: 0.2 + i * 0.15, type: 'spring', stiffness: 200 }}
                  className="text-5xl star-gold"
                  style={{
                    color: i <= stars ? '#f0d68a' : '#3b2a1a',
                    textShadow: i <= stars ? '0 0 20px rgba(240,214,138,0.6)' : 'none',
                  }}
                >
                  ★
                </motion.span>
              ))}
            </div>

            <p className="text-sm mb-8" style={{ color: '#8b7355' }}>
              {stars >= 3 ? '完美通关！全部答对！' : stars >= 1 ? '顺利通关，继续加油！' : '再接再厉！'}
            </p>

            {/* 双按钮 */}
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); onRetry() }}
                className="px-6 py-3 text-sm rounded transition-all"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(196,30,58,0.5)',
                  color: '#c41e3a',
                  cursor: 'pointer',
                }}
              >
                重新挑战
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => { e.stopPropagation(); onContinue() }}
                className="px-8 py-3 text-sm font-bold rounded transition-all"
                style={{
                  background: 'linear-gradient(135deg, #d4a843 0%, #b8860b 100%)',
                  color: '#2c1810',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(212,168,67,0.4)',
                  cursor: 'pointer',
                }}
              >
                继续征程 →
              </motion.button>
            </div>
          </motion.div>

          {/* 庆祝粒子 — 限时播放 */}
          {particlesOn && <CelebrationParticles />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CelebrationParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            top: '50%',
            left: '50%',
            opacity: 0,
            scale: 0,
          }}
          animate={{
            top: `${10 + Math.random() * 80}%`,
            left: `${10 + Math.random() * 80}%`,
            opacity: [0, 0.8, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{
            duration: 1.2 + Math.random() * 1.0,
            delay: Math.random() * 0.6,
            repeat: 0,
          }}
          style={{
            width: 4 + Math.random() * 6 + 'px',
            height: 4 + Math.random() * 6 + 'px',
            background: ['#f0d68a', '#d4a843', '#c41e3a', '#e8a87c'][Math.floor(Math.random() * 4)],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </div>
  )
}
