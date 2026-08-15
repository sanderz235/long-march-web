import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useGameStore from '../store/gameStore'

export default function LoginPage() {
  const { login, register, user } = useGameStore()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')

  if (user.isLoggedIn) {
    navigate('/game')
    return null
  }

  const handleSubmit = () => {
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码')
      return
    }
    if (username.trim().length < 2) {
      setError('用户名至少2个字符')
      return
    }
    if (password.length < 3) {
      setError('密码至少3位')
      return
    }

    if (mode === 'register') {
      const ok = register(username.trim(), password)
      if (!ok) {
        setError('用户名已存在')
        return
      }
    }

    login(username.trim(), password)
    navigate('/game')
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, #c41e3a 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      <div
        className="relative z-10 w-96 p-8 rounded-lg animate-float-up"
        style={{
          background: 'linear-gradient(180deg, rgba(59,42,26,0.95) 0%, rgba(59,42,26,0.9) 100%)',
          border: '1px solid rgba(212,168,67,0.3)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
        }}
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
            style={{
              background: 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)',
              boxShadow: '0 0 20px rgba(196,30,58,0.4)',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="#f0d68a" />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-wider" style={{ color: '#f4e4c1', fontFamily: 'serif' }}>
            {mode === 'login' ? '登录' : '注册'}
          </h2>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-3 text-sm rounded outline-none transition-all duration-200"
            style={{
              background: 'rgba(244,228,193,0.1)',
              border: '1px solid rgba(212,168,67,0.3)',
              color: '#f4e4c1',
            }}
          />
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-3 text-sm rounded outline-none transition-all duration-200"
            style={{
              background: 'rgba(244,228,193,0.1)',
              border: '1px solid rgba(212,168,67,0.3)',
              color: '#f4e4c1',
            }}
          />
          {error && (
            <p className="text-xs text-center" style={{ color: '#ff6b6b' }}>{error}</p>
          )}
          <button
            onClick={handleSubmit}
            className="w-full py-3 text-sm font-bold rounded transition-all duration-200 hover:scale-[1.02]"
            style={{
              color: '#f4e4c1',
              background: 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)',
              boxShadow: '0 4px 15px rgba(196,30,58,0.3)',
            }}
          >
            {mode === 'login' ? '登 录' : '注 册'}
          </button>
        </div>

        <p className="text-center mt-6">
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="text-xs transition-colors duration-200"
            style={{ color: '#d4a843' }}
          >
            {mode === 'login' ? '没有账号？点击注册' : '已有账号？点击登录'}
          </button>
        </p>

        <p className="text-center mt-3 text-xs" style={{ color: '#8b7355' }}>
          首次登录自动注册，进度保存在本地
        </p>
      </div>
    </div>
  )
}
