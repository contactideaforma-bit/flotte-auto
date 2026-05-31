import { AlertStatus } from '@/lib/utils'

const config: Record<AlertStatus, { label: string; bg: string; color: string }> = {
  ok:      { label: 'OK',     bg: 'var(--ok-light)',     color: 'var(--ok)' },
  warning: { label: '',        bg: 'var(--warn-light)',   color: 'var(--warn)' },
  expired: { label: 'Échu',   bg: 'var(--danger-light)', color: 'var(--danger)' },
  none:    { label: '—',      bg: '#f0f0f0',              color: '#999' },
}

export default function StatusBadge({ status, days }: { status: AlertStatus; days: number | null }) {
  const { label, bg, color } = config[status]
  const text = status === 'warning' && days !== null ? `J-${days}` : label
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 500,
      background: bg, color,
    }}>{text}</span>
  )
}
