import { Link } from 'react-router-dom'

export default function HomePage() {

  return (
    <div className="flex flex-col items-center justify-center h-full relative overflow-hidden">
      {/* 装饰性背景 */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 30% 50%, #c41e3a 1px, transparent 1px), radial-gradient(circle at 70% 50%, #d4a843 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10 text-center animate-float-up">
        {/* 主标题 */}
        <h1
          className="text-7xl font-bold mb-4 tracking-[0.3em]"
          style={{
            color: '#c41e3a',
            textShadow: '2px 2px 0px rgba(139,0,0,0.2), 0 0 40px rgba(196,30,58,0.15)',
            fontFamily: 'serif',
          }}
        >
          长征
        </h1>
        <p
          className="text-xl mb-2 tracking-[0.5em]"
          style={{ color: '#5c3d2e', fontFamily: 'serif' }}
        >
          1934 — 1936
        </p>
        <p className="text-base mb-12" style={{ color: '#8b7355' }}>
          重温二万五千里，传承长征精神
        </p>

        {/* 三个入口卡片 */}
        <div className="flex gap-8 justify-center flex-wrap">
          <Link
            to="/learning"
            className="no-underline w-56 p-6 rounded-lg transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(180deg, rgba(244,228,193,0.6) 0%, rgba(212,184,150,0.4) 100%)',
              border: '1px solid rgba(139,0,0,0.2)',
              boxShadow: '0 4px 20px rgba(59,42,26,0.1)',
            }}
          >
            <div className="text-4xl mb-3">📖</div>
            <div className="text-lg font-bold mb-1" style={{ color: '#3b2a1a' }}>学习资料</div>
            <div className="text-sm" style={{ color: '#8b7355' }}>图文视频 · 长征知识</div>
          </Link>

          <Link
            to="/game"
            className="no-underline w-56 p-6 rounded-lg transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'linear-gradient(180deg, rgba(196,30,58,0.12) 0%, rgba(139,0,0,0.08) 100%)',
              border: '1px solid rgba(196,30,58,0.3)',
              boxShadow: '0 4px 20px rgba(196,30,58,0.1)',
            }}
          >
            <div className="text-4xl mb-3">⚔️</div>
            <div className="text-lg font-bold mb-1" style={{ color: '#c41e3a' }}>长征闯关</div>
            <div className="text-sm" style={{ color: '#8b7355' }}>
              开始闯关
            </div>
          </Link>
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="w-16 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,0,0,0.3))' }} />
        <span className="text-xs tracking-widest" style={{ color: '#8b7355' }}>红色记忆 · 薪火相传</span>
        <div className="w-16 h-px" style={{ background: 'linear-gradient(90deg, rgba(139,0,0,0.3), transparent)' }} />
      </div>
    </div>
  )
}
