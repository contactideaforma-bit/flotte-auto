'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Car, Bell, LogOut, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

const nav = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/vehicles',  label: 'Véhicules',        icon: Car },
  { href: '/dashboard#alertes', label: 'Alertes',  icon: Bell },
  { href: '/profile',   label: 'Profil',            icon: UserCircle },
]

export default function Sidebar({ alertCount = 0, userEmail = '', displayName = '' }: {
  alertCount?: number
  userEmail?: string
  displayName?: string
}) {
  const path = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const userLabel = displayName || userEmail

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: 'var(--bg-sidebar)',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh',
      borderRight: '1px solid var(--border-strong)',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem 1.25rem 1rem',
        borderBottom: '1px solid rgba(233,30,140,0.15)',
        background: 'linear-gradient(180deg, rgba(155,0,255,0.08) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--glow-sm)',
          }}>
            <Car size={18} color="#fff" />
          </div>
          <span style={{
            fontSize: 13, fontWeight: 700, color: '#fff',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.06em',
          }}>FLOTTE AUTO</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem 0' }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href))
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 1.25rem',
                background: active
                  ? 'linear-gradient(90deg, rgba(233,30,140,0.2) 0%, rgba(155,0,255,0.08) 100%)'
                  : 'transparent',
                color: active ? '#fff' : 'var(--text-sidebar)',
                fontSize: 13, fontWeight: active ? 600 : 400,
                transition: 'background 0.15s',
                cursor: 'pointer',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-sidebar-hover)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
              >
                <Icon size={17} style={{ color: active ? 'var(--accent)' : 'inherit' }} />
                <span>{label}</span>
                {label === 'Alertes' && alertCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'var(--danger)',
                    color: '#fff', fontSize: 10, padding: '1px 7px',
                    borderRadius: 20, fontWeight: 600,
                    boxShadow: '0 0 8px rgba(255,45,85,0.5)',
                  }}>{alertCount}</span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(233,30,140,0.15)' }}>
        {userLabel && (
          <div style={{
            fontSize: 11, color: 'rgba(201,160,255,0.6)',
            marginBottom: 10, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {userLabel}
          </div>
        )}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '8px 10px',
          background: 'rgba(233,30,140,0.08)',
          border: '1px solid rgba(233,30,140,0.2)',
          borderRadius: 8, color: 'var(--text-sidebar)',
          fontSize: 13, cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(233,30,140,0.18)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(233,30,140,0.08)')}
        >
          <LogOut size={15} /> Déconnexion
        </button>
      </div>
    </aside>
  )
}
