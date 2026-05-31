'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Car, AlertTriangle, CheckCircle, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase-client'
import Sidebar from '@/components/Sidebar'
import VehicleModal from '@/components/VehicleModal'
import MiniCalendar from '@/components/MiniCalendar'
import StatusBadge from '@/components/StatusBadge'
import { Vehicle, VehicleInsert } from '@/lib/supabase'
import { getAlertDate, getDaysUntilAlert, getAlertStatus, isCompliant, ALERT_DAYS } from '@/lib/utils'

export default function Dashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)
  const [delId, setDelId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')

  const fetchVehicles = useCallback(async () => {
    const res = await window.fetch('/api/vehicles')
    const data = await res.json()
    setVehicles(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchVehicles()
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email)
    })
  }, [fetchVehicles])

  const handleSave = async (form: VehicleInsert) => {
    if (editVehicle) {
      await window.fetch(`/api/vehicles/${editVehicle.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
    } else {
      await window.fetch('/api/vehicles', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
    }
    setModalOpen(false)
    setEditVehicle(null)
    await fetchVehicles()
  }

  const handleDelete = async () => {
    if (!delId) return
    await window.fetch(`/api/vehicles/${delId}`, { method: 'DELETE' })
    setDelId(null)
    await fetchVehicles()
  }

  const alertCount = vehicles.filter(v => { const d = getDaysUntilAlert(v); return d !== null && d <= 10 }).length
  const compliantCount = vehicles.filter(isCompliant).length
  const alertDays = new Set<string>(vehicles.flatMap(v => { const a = getAlertDate(v); return a ? [format(a, 'yyyy-MM-dd')] : [] }))
  const upcomingAlerts = vehicles
    .map(v => ({ v, days: getDaysUntilAlert(v) }))
    .filter(({ days }) => days !== null && days <= 30)
    .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
    .slice(0, 6)

  const dotColor = (days: number | null) => days === null ? '#ccc' : days <= 0 ? 'var(--danger)' : days <= 10 ? 'var(--warn)' : 'var(--ok)'
  const ck = (ok: boolean) => <span style={{ fontSize: 16, color: ok ? 'var(--ok)' : '#ccc' }}>{ok ? '✓' : '✗'}</span>

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar alertCount={alertCount} userEmail={userEmail} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: 17, fontWeight: 500 }}>Tableau de bord</h1>
          <button onClick={() => { setEditVehicle(null); setModalOpen(true) }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 9, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <Plus size={16} /> Ajouter un véhicule
          </button>
        </header>

        <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { icon: <Car size={16} />, label: 'Véhicules total', value: vehicles.length, sub: 'dans le parc', color: 'var(--accent)' },
              { icon: <AlertTriangle size={16} />, label: 'Alertes actives', value: alertCount, sub: 'assurances à renouveler', color: 'var(--danger)' },
              { icon: <CheckCircle size={16} />, label: 'Véhicules conformes', value: compliantCount, sub: 'CT + CG + entretien à jour', color: 'var(--ok)' },
            ].map(({ icon, label, value, sub, color }) => (
              <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <span style={{ color }}>{icon}</span>{label}
                </div>
                <div style={{ fontSize: 30, fontWeight: 500, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Calendar + Alerts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: '1rem' }}>Calendrier des alertes</div>
              <MiniCalendar alertDays={alertDays} />
            </div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 500 }}>Prochaines alertes</div>
              {upcomingAlerts.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <CheckCircle size={24} style={{ color: 'var(--ok)', display: 'block', margin: '0 auto 8px' }} />
                  Aucune alerte dans les 30 jours
                </div>
              ) : upcomingAlerts.map(({ v, days }) => (
                <div key={v.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor(days), flexShrink: 0, marginTop: 4 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{v.immat} — {v.model}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {days !== null && days <= 0 ? 'Échéance dépassée' : `Dans ${days} jour${days !== 1 ? 's' : ''}`}
                      {' · '}Alerte assurance (J+{ALERT_DAYS})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fleet table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Parc véhicules</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''}</span>
            </div>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>Chargement…</div>
            ) : vehicles.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
                Aucun véhicule — cliquez sur "Ajouter un véhicule" pour commencer.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-base)' }}>
                      {['Immat.','Modèle','Conducteur','Tél.','Assurance','Souscription','Sinistre','CT','CG','Entretien','Statut',''].map(h => (
                        <th key={h} style={{ padding: '9px 12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map(v => (
                      <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-base)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 500 }}>{v.immat}</td>
                        <td style={{ padding: '10px 12px' }}>{v.model}</td>
                        <td style={{ padding: '10px 12px' }}>{v.conducteur || '—'}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v.tel || '—'}</td>
                        <td style={{ padding: '10px 12px' }}>{v.assurance || '—'}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: 11 }}>{v.date_assurance ? format(new Date(v.date_assurance), 'dd/MM/yyyy') : '—'}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', fontSize: 11 }}>{v.date_sinistre ? format(new Date(v.date_sinistre), 'dd/MM/yyyy') : '—'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>{ck(v.ct_ok)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>{ck(v.cg_ok)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>{ck(v.entretien_ok)}</td>
                        <td style={{ padding: '10px 12px' }}><StatusBadge status={getAlertStatus(v)} days={getDaysUntilAlert(v)} /></td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => { setEditVehicle(v); setModalOpen(true) }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '3px 5px', borderRadius: 5, cursor: 'pointer' }} title="Modifier"><Pencil size={14} /></button>
                            <button onClick={() => setDelId(v.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', padding: '3px 5px', borderRadius: 5, cursor: 'pointer' }} title="Supprimer"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {modalOpen && <VehicleModal vehicle={editVehicle} onClose={() => { setModalOpen(false); setEditVehicle(null) }} onSave={handleSave} />}

      {delId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', padding: '1.5rem', width: 340, textAlign: 'center' }} className="fade-in">
            <Trash2 size={28} style={{ color: 'var(--danger)', margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Supprimer ce véhicule ?</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {vehicles.find(v => v.id === delId)?.immat} — {vehicles.find(v => v.id === delId)?.model}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => setDelId(null)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid var(--border-strong)', background: 'transparent', fontSize: 13, cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleDelete} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--danger)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
