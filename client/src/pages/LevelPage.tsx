import { useState, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useGameStore from '../store/gameStore'
import { LEVELS } from '../data/levels'
import CelebrationOverlay from '../components/game/CelebrationOverlay'

export default function LevelPage() {
  const { levelId } = useParams<{ levelId: string }>()
  const navigate = useNavigate()
  const { completeLevel } = useGameStore()

  const id = parseInt(levelId || '1')
  const level = LEVELS.find((l) => l.id === id)

  const [phase, setPhase] = useState<'video' | 'quiz' | 'result'>('video')
  const [currentQ, setCurrentQ] = useState(0)
  // -1 = 未答，0-4 = 已选选项索引
  const [answers, setAnswers] = useState<number[]>(Array(level?.questions.length || 0).fill(-1))
  const [showFeedback, setShowFeedback] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)
  const [showFinale, setShowFinale] = useState(false)
  const [introAchievement, setIntroAchievement] = useState(false)
  const autoTimer = useRef<number | null>(null)

  const clearTimer = () => {
    if (autoTimer.current !== null) { clearTimeout(autoTimer.current); autoTimer.current = null }
  }

  if (!level) {
    return <div className="p-8 text-center" style={{ color: '#c41e3a' }}>关卡不存在</div>
  }

  // 序章
  if (level.isIntro) {
    if (introAchievement) {
      return (
        <AchievementToast
          visible
          levelName={level.fullName}
          onDismiss={() => {
            setIntroAchievement(false)
            navigate('/game')
          }}
        />
      )
    }
    return (
      <IntroLevelPage
        level={level}
        onComplete={() => {
          completeLevel(1, 3)
          setIntroAchievement(true)
        }}
      />
    )
  }

  const questions = level.questions
  const q = questions[currentQ]

  const calculateResult = (finalAnswers: number[]) => {
    const correctCount = finalAnswers.filter((a, i) => a === questions[i].correctIndex).length
    const stars = correctCount >= 5 ? 3 : correctCount >= 4 ? 2 : correctCount >= 3 ? 1 : 0
    if (stars > 0) {
      completeLevel(id, stars)
      setShowCelebration(true)
    } else {
      setPhase('result')
    }
  }

  const isCurrentAnswered = answers[currentQ] !== -1
  const isLastQ = currentQ === questions.length - 1
  const allAnswered = answers.every(a => a !== -1)

  const handleAnswer = (optionIndex: number) => {
    if (showFeedback || isCurrentAnswered) return
    const newAnswers = [...answers]
    newAnswers[currentQ] = optionIndex
    setAnswers(newAnswers)
    setSelectedOption(optionIndex)
    setShowFeedback(true)

    if (optionIndex === q.correctIndex) {
      // 答对 → 自动跳到下一题
      const allDone = newAnswers.every(a => a !== -1)
      if (isLastQ && allDone) {
        clearTimer()
        autoTimer.current = window.setTimeout(() => calculateResult(newAnswers), 1200)
      } else if (!isLastQ) {
        clearTimer()
        autoTimer.current = window.setTimeout(() => {
          setShowFeedback(false)
          setSelectedOption(null)
          setCurrentQ(prev => prev + 1)
        }, 1200)
      }
    }
    // 答错 → 不自动跳，停留在当前题，用户通过按钮手动前进
  }

  const handleNext = () => {
    clearTimer()
    if (allAnswered && isLastQ) {
      calculateResult(answers)
      return
    }
    // 前进到下一题（如果已答过，显示其反馈状态；未答过则清空）
    setCurrentQ(prev => {
      const next = prev + 1
      setSelectedOption(answers[next] !== -1 ? answers[next] : null)
      setShowFeedback(answers[next] !== -1)
      return Math.min(next, questions.length - 1)
    })
  }

  const handlePrev = () => {
    clearTimer()
    setCurrentQ(prev => {
      const next = prev - 1
      setSelectedOption(answers[next] !== -1 ? answers[next] : null)
      setShowFeedback(answers[next] !== -1)
      return next
    })
  }

  // --- 结果数据 ---
  const correctCount = answers.filter((a, i) => a === questions[i].correctIndex).length
  const earnedStars = correctCount >= 5 ? 3 : correctCount >= 4 ? 2 : correctCount >= 3 ? 1 : 0

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative">
      {/* 顶部导航 */}
      <div className="absolute top-4 left-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/game')}
          className="text-sm transition-colors duration-200"
          style={{ color: '#8b7355' }}
        >
          ← 返回地图
        </button>
        <span className="text-sm" style={{ color: '#5c3d2e' }}>
          {level.fullName}
        </span>
      </div>

      {phase === 'video' && (
        <div className="text-center max-w-4xl w-full">
          <h1 className="text-3xl font-bold mb-4" style={{ color: '#3b2a1a', fontFamily: 'serif' }}>
            {level.fullName}
          </h1>
          <p className="text-base mb-8" style={{ color: '#5c3d2e' }}>
            {level.shortDesc}
          </p>

          {(() => {
            const videoUrl = level.videoUrl
            if (videoUrl) {
              const [bvid, pParam] = videoUrl.split('?p=')
              const videoPart = pParam || '1'
              return (
                <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl" style={{ border: '3px solid #c41e3a' }}>
                  <iframe
                    src={`https://player.bilibili.com/player.html?bvid=${bvid}&p=${videoPart}&autoplay=0`}
                    className="w-full h-full"
                    allowFullScreen
                    style={{ border: 'none' }}
                  />
                </div>
              )
            }
            return (
              <div
                className="w-full max-w-5xl aspect-video rounded-xl mb-8 flex items-center justify-center shadow-xl"
                style={{
                  background: 'linear-gradient(180deg, rgba(59,42,26,0.1) 0%, rgba(59,42,26,0.05) 100%)',
                  border: '2px dashed rgba(139,0,0,0.2)',
                }}
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">🎬</div>
                  <p className="text-sm" style={{ color: '#8b7355' }}>学习视频将在此播放</p>
                  <p className="text-xs mt-1" style={{ color: '#a09080' }}>
                    请先观看视频，了解 {level.fullName} 的历史背景
                  </p>
                </div>
              </div>
            )
          })()}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/game')}
              className="px-6 py-2 text-sm rounded transition-all duration-200"
              style={{ background: 'transparent', border: '1px solid rgba(139,0,0,0.2)', color: '#5c3d2e' }}
            >
              返回地图
            </button>
            <button
              onClick={() => setPhase('quiz')}
              className="px-8 py-2 text-sm font-bold rounded transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)',
                color: '#f4e4c1', border: 'none',
                boxShadow: '0 4px 15px rgba(196,30,58,0.3)',
              }}
            >
              开始答题
            </button>
          </div>
        </div>
      )}

      {phase === 'quiz' && (
        <div className="w-full max-w-2xl">
          {/* 进度条 */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(139,0,0,0.1)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(answers.filter(a => a !== -1).length / questions.length) * 100}%`,
                  background: 'linear-gradient(90deg, #c41e3a, #d4a843)',
                }}
              />
            </div>
            <span className="text-sm" style={{ color: '#8b7355' }}>
              {currentQ + 1}/{questions.length}
            </span>
          </div>

          {/* 题目 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ + (showFeedback ? '_fb' : '_q')}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-8 leading-relaxed" style={{ color: '#3b2a1a', fontFamily: 'serif' }}>
                {q.question}
              </h2>

              <div className="grid gap-3">
                {q.options.map((option, oi) => {
                  let bgColor = 'rgba(244,228,193,0.6)'
                  let borderColor = 'rgba(139,0,0,0.15)'
                  let textColor = '#3b2a1a'
                  const wasSelected = selectedOption === oi

                  if (showFeedback) {
                    if (oi === q.correctIndex) {
                      bgColor = 'rgba(74,103,65,0.2)'; borderColor = '#4a6741'; textColor = '#2d4a1e'
                    } else if (wasSelected && oi !== q.correctIndex) {
                      bgColor = 'rgba(196,30,58,0.15)'; borderColor = '#c41e3a'; textColor = '#8b0000'
                    }
                  } else if (wasSelected) {
                    bgColor = 'rgba(212,168,67,0.2)'; borderColor = '#d4a843'
                  }

                  return (
                    <motion.button
                      key={oi}
                      whileHover={!showFeedback ? { scale: 1.01 } : {}}
                      whileTap={!showFeedback ? { scale: 0.99 } : {}}
                      onClick={() => handleAnswer(oi)}
                      disabled={showFeedback || isCurrentAnswered}
                      className="text-left px-5 py-4 rounded-lg transition-all duration-200"
                      style={{
                        background: bgColor, border: `2px solid ${borderColor}`,
                        color: textColor, cursor: showFeedback || isCurrentAnswered ? 'default' : 'pointer',
                      }}
                    >
                      <span
                        className="inline-block w-7 h-7 rounded-full text-center text-sm font-bold mr-3 leading-7"
                        style={{
                          background: showFeedback && oi === q.correctIndex ? '#4a6741'
                            : showFeedback && wasSelected && oi !== q.correctIndex ? '#c41e3a'
                            : '#8b7355',
                          color: '#f4e4c1',
                        }}
                      >
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {option}
                    </motion.button>
                  )
                })}
              </div>

              {showFeedback && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-4 text-sm text-center"
                  style={{ color: selectedOption === q.correctIndex ? '#4a6741' : '#c41e3a' }}
                >
                  {selectedOption === q.correctIndex
                    ? '✓ 回答正确！'
                    : `✗ 正确答案是 ${String.fromCharCode(65 + q.correctIndex)}`}
                </motion.p>
              )}

              {/* 上一题 / 下一题 按钮 */}
              <div className="flex justify-between mt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={handlePrev}
                  disabled={currentQ === 0}
                  className="px-5 py-2 text-sm rounded transition-all"
                  style={{
                    background: currentQ === 0 ? 'rgba(139,0,0,0.05)' : 'rgba(139,0,0,0.08)',
                    border: `1px solid ${currentQ === 0 ? 'rgba(139,0,0,0.08)' : 'rgba(139,0,0,0.2)'}`,
                    color: currentQ === 0 ? '#b0a090' : '#5c3d2e',
                    cursor: currentQ === 0 ? 'default' : 'pointer',
                  }}
                >
                  ← 上一题
                </motion.button>

                <motion.button
                  whileHover={isCurrentAnswered ? { scale: 1.03 } : {}}
                  whileTap={isCurrentAnswered ? { scale: 0.97 } : {}}
                  onClick={handleNext}
                  disabled={!isCurrentAnswered}
                  className="px-5 py-2 text-sm font-bold rounded transition-all"
                  style={{
                    background: isCurrentAnswered
                      ? 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)'
                      : 'rgba(139,0,0,0.05)',
                    border: isCurrentAnswered ? 'none' : '1px solid rgba(139,0,0,0.08)',
                    color: isCurrentAnswered ? '#f4e4c1' : '#b0a090',
                    boxShadow: isCurrentAnswered ? '0 4px 15px rgba(196,30,58,0.3)' : 'none',
                    cursor: isCurrentAnswered ? 'pointer' : 'default',
                  }}
                >
                  {allAnswered && isLastQ ? '查看结果' : '下一题 →'}
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* 失败页面 — 统一浮现动画风格 */}
      <AnimatePresence>
        {phase === 'result' && (
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
                border: '2px solid rgba(240,214,138,0.35)',
                boxShadow: '0 0 60px rgba(196,30,58,0.15)',
              }}
            >
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#c41e3a', fontFamily: 'serif' }}>
                未通过
              </h2>
              <p className="text-lg mb-2" style={{ color: '#d4b896' }}>
                {level.fullName}
              </p>
              <p className="text-base mb-1" style={{ color: '#8b7355' }}>
                答对 {correctCount} / {questions.length} 题
              </p>
              <p className="text-sm mb-8" style={{ color: '#c41e3a' }}>
                答对不足 3 题，需要重新挑战
              </p>
              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/game')}
                  className="px-6 py-3 text-sm rounded transition-all"
                  style={{
                    background: 'transparent', border: '1px solid rgba(196,30,58,0.5)', color: '#c41e3a',
                  }}
                >
                  返回地图
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setPhase('quiz')
                    setCurrentQ(0)
                    setAnswers(Array(questions.length).fill(-1))
                    setSelectedOption(null)
                    setShowFeedback(false)
                  }}
                  className="px-8 py-3 text-sm font-bold rounded transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #d4a843 0%, #b8860b 100%)',
                    color: '#2c1810', border: 'none',
                    boxShadow: '0 4px 20px rgba(212,168,67,0.4)',
                  }}
                >
                  再来一次
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 星星庆祝 */}
      <CelebrationOverlay
        visible={showCelebration}
        stars={earnedStars}
        levelName={level.fullName}
        onContinue={() => {
          setShowCelebration(false)
          if (id === 10) {
            setShowFinale(true)
          } else {
            setShowAchievement(true)
          }
        }}
        onRetry={() => {
          setShowCelebration(false)
          setPhase('quiz')
          setCurrentQ(0)
          setAnswers(Array(questions.length).fill(-1))
          setSelectedOption(null)
          setShowFeedback(false)
        }}
      />

      {/* 达成成就 — 在通关页内显示，丝滑切换 */}
      <AchievementToast
        visible={showAchievement}
        levelName={level.fullName}
        onDismiss={() => {
          setShowAchievement(false)
          navigate('/game')
        }}
      />

      <FinaleOverlay
        visible={showFinale}
        onComplete={() => {
          setShowFinale(false)
          setShowAchievement(true)
        }}
      />
    </div>
  )
}

// ======== 达成成就弹层 ========

function AchievementToast({ visible, levelName, onDismiss }: {
  visible: boolean
  levelName: string
  onDismiss: () => void
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onDismiss}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
          style={{ background: 'rgba(15,5,2,0.95)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center"
          >
            <p style={{
              color: '#d4b896', fontFamily: 'serif', fontSize: '1.2rem',
              letterSpacing: '0.2em', marginBottom: '10px',
            }}>
              — 达成成就 —
            </p>
            <h2 style={{
              color: '#f0d68a', fontFamily: 'serif', fontSize: '2.2rem',
              fontWeight: 'bold', letterSpacing: '0.12em',
              textShadow: '0 0 30px rgba(240,214,138,0.25)',
            }}>
              {levelName}
            </h2>
            <p className="mt-8 text-sm" style={{ color: '#8b7355', fontFamily: 'serif' }}>
              点击任意位置继续...
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ======== 序章 ========

function IntroLevelPage({ level, onComplete }: { level: typeof LEVELS[0]; onComplete: () => void }) {
  const pages = level.introPages || []
  const [pageIndex, setPageIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const particles = useMemo(() => {
    const s = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
    return Array.from({ length: 18 }, (_, i) => ({
      w: 2 + s(i * 7 + 1) * 3, h: 2 + s(i * 7 + 2) * 3,
      left: `${3 + s(i * 7 + 3) * 94}%`, top: `${3 + s(i * 7 + 4) * 94}%`,
      opacity: 0.06 + s(i * 7 + 5) * 0.12,
    }))
  }, [])

  const nextPage = () => {
    if (isAnimating) return
    if (pageIndex >= pages.length - 1) { onComplete(); return }
    setIsAnimating(true)
    setPageIndex(pageIndex + 1)
  }

  const page = pages[pageIndex]

  return (
    <div
      className="h-full flex flex-col items-center justify-center cursor-pointer relative select-none"
      onClick={nextPage}
      style={{ background: 'linear-gradient(180deg, #1a0f0a 0%, #2a1f14 50%, #1a0f0a 100%)' }}
    >
      {particles.map((p, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: p.w + 'px', height: p.h + 'px', left: p.left, top: p.top,
          background: '#f0d68a', opacity: p.opacity,
        }} />
      ))}
      <AnimatePresence mode="wait" onExitComplete={() => setIsAnimating(false)}>
        <motion.div
          key={pageIndex}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="text-center max-w-2xl px-12"
        >
          {page.title && (
            <h1 className="text-7xl font-bold mb-6 tracking-[0.3em]" style={{ color: '#c41e3a', fontFamily: 'serif' }}>
              {page.title}
            </h1>
          )}
          {page.lines.map((line, i) => (
            <p key={i} className="mb-3 leading-relaxed" style={{
              color: '#d4b896', fontSize: line.length > 30 ? '1.1rem' : '1.4rem', fontFamily: 'serif',
            }}>
              {line}
            </p>
          ))}
          {pageIndex === pages.length - 1 && (
            <button
              className="mt-8 px-10 py-3 text-lg font-bold rounded transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)',
                color: '#f4e4c1', border: 'none', boxShadow: '0 4px 20px rgba(196,30,58,0.4)',
              }}
              onClick={(e) => { e.stopPropagation(); onComplete() }}
            >
              出 发！
            </button>
          )}
          {pageIndex < pages.length - 1 && (
            <p className="mt-12 text-sm animate-pulse-slow" style={{ color: '#8b7355' }}>
              点击任意位置继续...
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ======== 胜利会师（第10关终章） ========

function FinaleOverlay({ visible, onComplete }: { visible: boolean; onComplete: () => void }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const pages = [
    {
      lines: ['两万五千里的漫漫征途，', '三百六十八个日日夜夜……'],
    },
    {
      lines: ['翻越 18 座大山，海拔 4000 米以上的雪山 5 座，', '跨过 24 条大河，穿越 11 个省……'],
    },
    {
      lines: ['经历 600 余次战役战斗，', '攻占 700 多座县城，牺牲营以上干部 430 余人……'],
    },
    {
      lines: ['出发时 8.6 万余人，到达陕北时仅剩约 7000 人。', '平均每 300 米就有一名红军战士倒下……'],
    },
    {
      lines: ['但他们从未放弃，', '用坚定的信念和钢铁般的意志，', '谱写了人类历史上最壮丽的英雄史诗！'],
    },
  ];

  const particles = useMemo(() => {
    const s = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) };
    return Array.from({ length: 18 }, (_, i) => ({
      w: 2 + s(i * 7 + 1) * 3, h: 2 + s(i * 7 + 2) * 3,
      left: `${3 + s(i * 7 + 3) * 94}%`, top: `${3 + s(i * 7 + 4) * 94}%`,
      opacity: 0.06 + s(i * 7 + 5) * 0.12,
    }));
  }, []);

  const nextPage = () => {
    if (isAnimating) return;
    if (pageIndex >= pages.length - 1) { onComplete(); return; }
    setIsAnimating(true);
    setPageIndex(pageIndex + 1);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center cursor-pointer select-none"
          onClick={nextPage}
          style={{ background: 'linear-gradient(180deg, #1a0f0a 0%, #2a1f14 50%, #1a0f0a 100%)' }}
        >
          {particles.map((p, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: p.w + 'px', height: p.h + 'px', left: p.left, top: p.top,
              background: '#f0d68a', opacity: p.opacity,
            }} />
          ))}
          <AnimatePresence mode="wait" onExitComplete={() => setIsAnimating(false)}>
            <motion.div
              key={pageIndex}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              className="text-center max-w-2xl px-12"
            >
              {pageIndex === 0 && (
                <h1 className="text-5xl font-bold mb-6 tracking-[0.2em]" style={{ color: '#f0d68a', fontFamily: 'serif' }}>
                  长征·总结
                </h1>
              )}
              {pages[pageIndex].lines.map((line, i) => (
                <p key={i} className="mb-3 leading-relaxed" style={{
                  color: '#d4b896', fontSize: line.length > 20 ? '1.1rem' : '1.4rem', fontFamily: 'serif',
                }}>
                  {line}
                </p>
              ))}
              {pageIndex === pages.length - 1 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mt-8"
                >
                  <h2 className="text-4xl font-bold mb-8 tracking-[0.15em]" style={{ color: '#c41e3a', fontFamily: 'serif', textShadow: '0 0 40px rgba(196,30,58,0.3)' }}>
                    恭喜通关！长征胜利！
                  </h2>
                  <p className="text-lg mb-8" style={{ color: '#f0d68a', fontFamily: 'serif', letterSpacing: '0.1em' }}>
                    长征精神，永放光芒！
                  </p>
                  <div className="flex gap-6 justify-center" onClick={(e) => e.stopPropagation()}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { window.location.href = '/game' }}
                      className="px-8 py-3 text-sm font-bold rounded transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #d4a843 0%, #b8860b 100%)',
                        color: '#2c1810', border: 'none',
                        boxShadow: '0 4px 20px rgba(212,168,67,0.4)',
                      }}
                    >
                      返回地图
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { window.location.href = '/' }}
                      className="px-8 py-3 text-sm font-bold rounded transition-all"
                      style={{
                        background: 'transparent',
                        border: '2px solid rgba(196,30,58,0.6)',
                        color: '#c41e3a',
                      }}
                    >
                      返回首页
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <p className="mt-12 text-sm animate-pulse-slow" style={{ color: '#8b7355' }}>
                  点击任意位置继续...
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
