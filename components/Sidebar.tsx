'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Car, Bell, Settings } from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/vehicles',  label: 'Véhicules',        icon: Car },
  { href: '/dashboard#alertes', label: 'Alertes', icon: Bell },
  { href: '/dashboard#settings', label: 'Paramètres', icon: Settings },
]

export default function Sidebar({ alertCount = 0 }: { alertCount?: number }) {
  const path = usePathname()
  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: 'var(--bg-sidebar)',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Car size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>Flotte auto</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-sidebar)', paddingLeft: 42 }}>
          Mymy la King 👑
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0.75rem 0' }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href))
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 1.25rem',
                background: active ? 'var(--bg-sidebar-active)' : 'transparent',
                color: active ? '#fff' : 'var(--text-sidebar)',
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                transition: 'background 0.15s, color 0.15s',
                cursor: 'pointer',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-sidebar-hover)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <Icon size={17} />
                <span>{label}</span>
                {label === 'Alertes' && alertCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'var(--danger)',
                    color: '#fff',
                    fontSize: 10,
                    padding: '1px 7px',
                    borderRadius: 20,
                    fontWeight: 500,
                  }}>{alertCount}</span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-sidebar)', lineHeight: 1.5 }}>
          Alertes assurance<br />
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>J+40 après souscription</span>
        </div>
      </div>
    </aside>
  )
}
