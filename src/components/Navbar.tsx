import { useState } from 'react'
import { Link } from 'react-router-dom'
import useGameStore from '../store/gameStore'

const NAV_ITEMS = [
  {
    label: '学习资料',
    type: 'dropdown' as const,
    children: [
      { label: '图文资料', href: '/learning?tab=article' },
      { label: '视频资料', href: '/learning?tab=video' },
      { label: '历史地图', href: '/learning?tab=map' },
    ],
  },
  {
    label: '长征闯关',
    type: 'link' as const,
    href: '/game',
    highlight: true,
  },
]

export default function Navbar() {
  // openDropdown：悬停展开的菜单；pinnedDropdown：点击后固定展开的菜单（鼠标移开不收起）
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [pinnedDropdown, setPinnedDropdown] = useState<string | null>(null)

  const isDropdownOpen = (label: string) => openDropdown === label || pinnedDropdown === label

  // 点击按钮：已固定 → 收起；未固定 → 固定展开
  const handleDropdownClick = (label: string) => {
    if (pinnedDropdown === label) {
      setPinnedDropdown(null)
      setOpenDropdown(null)
    } else {
      setPinnedDropdown(label)
      setOpenDropdown(label)
    }
  }

  const closeDropdown = () => {
    setOpenDropdown(null)
    setPinnedDropdown(null)
  }

  return (
    <nav
      className="relative z-50 flex items-center justify-between h-16 px-6"
      style={{
        background: 'linear-gradient(180deg, rgba(59,42,26,0.95) 0%, rgba(59,42,26,0.9) 100%)',
        borderBottom: '2px solid rgba(212,168,67,0.4)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* 第1部分：LOGO + 名称 */}
      <Link to="/" className="flex items-center gap-3 no-underline">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)',
            boxShadow: '0 0 12px rgba(196,30,58,0.5)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="#f0d68a" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-wider" style={{ color: '#f4e4c1', fontFamily: 'serif' }}>
          长征知识学习平台
        </span>
      </Link>

      {/* 第2、3部分：导航链接 */}
      <div className="flex items-center gap-1">
        {NAV_ITEMS.map((item) =>
          item.type === 'dropdown' ? (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => setOpenDropdown(item.label)}
              onMouseLeave={() => { if (pinnedDropdown !== item.label) setOpenDropdown(null) }}
            >
              <button
                onClick={() => handleDropdownClick(item.label)}
                className="px-5 py-2 text-sm font-medium rounded transition-colors duration-200 flex items-center"
                style={{
                  color: isDropdownOpen(item.label) ? '#f0d68a' : '#d4b896',
                  background: isDropdownOpen(item.label) ? 'rgba(212,168,67,0.1)' : 'transparent',
                }}
              >
                {item.label}
                {/* 下拉箭头：展开时旋转 90° */}
                <svg
                  className="inline-block w-3 h-3 ml-1 transition-transform duration-300"
                  style={{ transform: isDropdownOpen(item.label) ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                  viewBox="0 0 12 12" fill="currentColor"
                >
                  <path d="M6 8L1 3h10z" />
                </svg>
              </button>
              {isDropdownOpen(item.label) && (
                <div
                  className="absolute top-full left-0 mt-1 py-2 w-40 rounded-md shadow-xl animate-float-up"
                  style={{
                    background: 'linear-gradient(180deg, #4a3728 0%, #3b2a1a 100%)',
                    border: '1px solid rgba(212,168,67,0.3)',
                  }}
                >
                  {item.children?.map((child) => (
                    <Link
                      key={child.label}
                      to={child.href}
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm transition-colors duration-200 no-underline"
                      style={{ color: '#d4b896' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(212,168,67,0.15)'
                        e.currentTarget.style.color = '#f0d68a'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#d4b896'
                      }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.label}
              to={item.href!}
              className="no-underline px-5 py-2 text-sm font-bold rounded transition-all duration-200"
              style={{
                color: item.highlight ? '#f0d68a' : '#d4b896',
                background: item.highlight
                  ? 'linear-gradient(135deg, rgba(196,30,58,0.6) 0%, rgba(139,0,0,0.4) 100%)'
                  : 'transparent',
                border: item.highlight ? '1px solid rgba(196,30,58,0.5)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (item.highlight) {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, rgba(196,30,58,0.8) 0%, rgba(139,0,0,0.6) 100%)'
                } else {
                  e.currentTarget.style.background = 'rgba(212,168,67,0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (item.highlight) {
                  e.currentTarget.style.background =
                    'linear-gradient(135deg, rgba(196,30,58,0.6) 0%, rgba(139,0,0,0.4) 100%)'
                } else {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              {item.label}
            </Link>
          )
        )}
      </div>

      {/* 第4部分：访客模式 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            const store = useGameStore.getState()
            store.resetProgress()
          }}
          className="px-3 py-1 text-xs rounded transition-colors duration-200"
          style={{ color: '#d4b896', border: '1px solid rgba(212,168,67,0.2)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(196,30,58,0.15)'
            e.currentTarget.style.borderColor = 'rgba(196,30,58,0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(212,168,67,0.2)'
          }}
        >
          重置进度
        </button>
        <span className="text-xs" style={{ color: '#8b7355' }}>访客模式</span>
      </div>
    </nav>
  )
}
