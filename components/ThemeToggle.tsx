'use client'
import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    const current = document.documentElement.getAttribute('data-theme') as 'dark' | 'light' | null
    setTheme(saved || current || 'dark')
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  if (!mounted) return null

  const isDark = theme === 'dark'

  if (compact) {
    // Version icône seule pour la sidebar
    return (
      <button
        onClick={toggle}
        title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 10,
          background: isDark ? 'rgba(255,184,0,0.12)' : 'rgba(155,0,255,0.12)',
          border: isDark ? '1px solid rgba(255,184,0,0.3)' : '1px solid rgba(155,0,255,0.25)',
          color: isDark ? '#ffb800' : 'var(--accent2)',
          cursor: 'pointer',
          transition: 'background 0.2s, border-color 0.2s',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          ;(e.currentTarget as HTMLButtonElement).style.background = isDark
            ? 'rgba(255,184,0,0.22)'
            : 'rgba(155,0,255,0.2)'
        }}
        onMouseLeave={e => {
          ;(e.currentTarget as HTMLButtonElement).style.background = isDark
            ? 'rgba(255,184,0,0.12)'
            : 'rgba(155,0,255,0.12)'
        }}
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    )
  }

  // Version complète pour la nav mobile (bottom nav)
  return (
    <button
      onClick={toggle}
      className="bottom-nav-item"
      style={{ background: 'none', border: 'none' }}
    >
      <div style={{ color: isDark ? '#ffb800' : 'var(--accent2)' }}>
        {isDark ? <Sun size={22} /> : <Moon size={22} />}
      </div>
      <span>{isDark ? 'Clair' : 'Sombre'}</span>
    </button>
  )
}
