'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Car, Bell, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

const nav = [
  { href: '/dashboard', label: 'Accueil',    icon: LayoutDashboard },
  { href: '/vehicles',  label: 'Véhicules',  icon: Car },
  { href: '/alertes',   label: 'Alertes',    icon: Bell },
]

export default function BottomNav({ alertCount = 0 }: { alertCount?: number }) {
  const path = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav className="bottom-nav">
      {nav.map(({ href, label, icon: Icon }) => {
        const active = path === href || (href !== '/dashboard' && path.startsWith(href))
        return (
          <Link key={href} href={href} className={`bottom-nav-item ${active ? 'active' : ''}`}>
            <div style={{ position: 'relative' }}>
              <Icon size={22} />
              {label === 'Alertes' && alertCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -6,
                  background: 'var(--danger)', color: '#fff',
                  fontSize: 9, padding: '1px 5px', borderRadius: 10,
                  fontWeight: 600, lineHeight: 1.4,
                }}>{alertCount}</span>
              )}
            </div>
            <span>{label}</span>
          </Link>
        )
      })}
      <button onClick={handleLogout} className="bottom-nav-item" style={{ background: 'none', border: 'none' }}>
        <LogOut size={22} />
        <span>Quitter</span>
      </button>
    </nav>
  )
}
