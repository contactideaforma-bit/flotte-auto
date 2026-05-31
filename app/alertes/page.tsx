'use client'
import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { format } from 'date-fns'
import BottomNav from '@/components/BottomNav'
import { Vehicle } from '@/lib/supabase'
import { getAlertDate, getDaysUntilAlert, ALERT_DAYS } from '@/lib/utils'

type AlertItem = {
  v: Vehicle
  days: number
  alertDate: Date
}

export default function AlertesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVehicles = useCallback(async () => {
    const res = await window.fetch('/api/vehicles')
    const data = await res.json()
    setVehicles(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  const allAlerts: AlertItem[] = vehicles
    .map(v => ({ v, days: getDaysUntilAlert(v) ?? Infinity, alertDate: getAlertDate(v)! }))
    .filter(x => x.alertDate && x.days !== Infinity)
    .sort((a, b) => a.days - b.days)

  const expired  = allAlerts.filter(a => a.days < 0)
  const urgent   = allAlerts.filter(a => a.days >= 0 && a.days <= 10)
  const upcoming = allAlerts.filter(a => a.days > 10 && a.days <= 60)
  const future   = allAlerts.filter(a => a.days > 60)

  const alertCount = expired.length + urgent.length

  const AlertCard = ({ item, variant }: { item: AlertItem; variant: 'expired' | 'urgent' | 'upcoming' | 'future' }) => {
    const colors = {
      expired:  { bg: 'var(--danger-light)',  border: '#fca5a5', dot: 'var(--danger)',  label: 'Échéance dépassée' },
      urgent:   { bg: 'var(--warn-light)',    border: '#fcd34d', dot: 'var(--warn)',    label: `Dans ${item.days} jour${item.days !== 1 ? 's' : ''}` },
      upcoming: { bg: 'var(--bg-card)',       border: 'var(--border)', dot: 'var(--ok)', label: `Dans ${item.days} jours` },
      future:   { bg: 'var(--bg-card)',       border: 'var(--border)', dot: '#ccc',      label: `Dans ${item.days} jours` },
    }
    const c = colors[variant]

    return (
      <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, padding: '1rem', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, flexShrink: 0, marginTop: 4 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 3 }}>{item.v.immat} — {item.v.model}</div>
          {item.v.conducteur && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>👤 {item.v.conducteur}</div>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Alerte J+{ALERT_DAYS} · {format(item.alertDate, 'dd/MM/yyyy')}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 500, padding: '2px 10px', borderRadius: 20,
              background: c.dot, color: variant === 'future' ? 'var(--text-secondary)' : '#fff',
              ...(variant === 'upcoming' ? { background: 'var(--ok-light)', color: 'var(--ok)' } : {}),
              ...(variant === 'future'   ? { background: '#f0f0f0', color: '#888' } : {}),
            }}>
              {c.label}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const Section = ({ title, items, icon, variant }: {
    title: string
    items: AlertItem[]
    icon: React.ReactNode
    variant: 'expired' | 'urgent' | 'upcoming' | 'future'
  }) => {
    if (items.length === 0) return null
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', paddingLeft: 2 }}>
          {icon} {title} ({items.length})
        </div>
        {items.map(item => <AlertCard key={item.v.id} item={item} variant={variant} />)}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      <header style={{
        background: 'var(--bg-sidebar)',
        padding: '1.25rem',
        paddingTop: 'max(3rem, calc(env(safe-area-inset-top) + 1.25rem))',
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Alertes</h1>
        <p style={{ fontSize: 12, color: 'var(--text-sidebar)' }}>Assurance — alerte à J+{ALERT_DAYS} après souscription</p>
      </header>

      <div style={{ padding: '1rem', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', fontSize: 13, color: 'var(--text-secondary)' }}>Chargement…</div>
        )}

        {!loading && allAlerts.length === 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '2.5rem', textAlign: 'center' }}>
            <CheckCircle size={36} style={{ color: 'var(--ok)', margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Tout est à jour</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Aucune alerte d'assurance en vue</div>
          </div>
        )}

        <Section title="Échues" items={expired} icon={<AlertTriangle size={14} color="var(--danger)" />} variant="expired" />
        <Section title="Urgentes — dans 10 jours" items={urgent} icon={<Clock size={14} color="var(--warn)" />} variant="urgent" />
        <Section title="À venir — 11 à 60 jours" items={upcoming} icon={<Clock size={14} color="var(--ok)" />} variant="upcoming" />
        <Section title="Planifiées — plus de 60 jours" items={future} icon={<CheckCircle size={14} color="#ccc" />} variant="future" />
      </div>

      <BottomNav alertCount={alertCount} />
    </div>
  )
}
