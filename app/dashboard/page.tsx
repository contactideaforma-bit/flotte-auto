'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Car, AlertTriangle, CheckCircle, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase-client'
import BottomNav from '@/components/BottomNav'
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
    .slice(0, 5)

  const dotColor = (days: number | null) => days === null ? '#ccc' : days <= 0 ? 'var(--danger)' : days <= 10 ? 'var(--warn)' : 'var(--ok)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* Header */}
      <header style={{
        background: 'var(--bg-sidebar)',
        padding: '3rem 1.25rem 1.25rem',
        paddingTop: 'max(3rem, calc(env(safe-area-inset-top) + 1.25rem))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-sidebar)', marginBottom: 2 }}>Mymy la King 👑</div>
            <h1 style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>Flotte auto</h1>
          </div>
          <button
            onClick={() => { setEditVehicle(null); setModalOpen(true) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: 10, border: 'none',
              background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500,
            }}
          >
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </header>

      <div className="page-content" style={{ padding: '1rem', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { icon: <Car size={15} />, label: 'Total', value: vehicles.length, color: 'var(--accent)' },
            { icon: <AlertTriangle size={15} />, label: 'Alertes', value: alertCount, color: 'var(--danger)' },
            { icon: <CheckCircle size={15} />, label: 'Conformes', value: compliantCount, color: 'var(--ok)' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '0.875rem 0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <span style={{ color }}>{icon}</span>{label}
              </div>
              <div style={{ fontSize: 26, fontWeight: 500, color, lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: '0.875rem' }}>Calendrier des alertes</div>
          <MiniCalendar alertDays={alertDays} />
        </div>

        {/* Upcoming alerts */}
        {upcomingAlerts.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)', fontSize: 13, fontWeight: 500 }}>
              Prochaines alertes
            </div>
            {upcomingAlerts.map(({ v, days }) => (
              <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor(days), flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.immat} — {v.model}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {days !== null && days <= 0 ? 'Échéance dépassée' : `Dans ${days} jour${days !== 1 ? 's' : ''}`} · J+{ALERT_DAYS}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vehicle list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', paddingLeft: 2 }}>
            Parc — {vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''}
          </div>

          {loading && <div style={{ textAlign: 'center', padding: '2rem', fontSize: 13, color: 'var(--text-secondary)' }}>Chargement…</div>}

          {!loading && vehicles.length === 0 && (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
              Aucun véhicule — appuyez sur "Ajouter"
            </div>
          )}

          {vehicles.map(v => {
            const status = getAlertStatus(v)
            const days = getDaysUntilAlert(v)
            const ck = (ok: boolean) => (
              <span style={{ fontSize: 13, color: ok ? 'var(--ok)' : '#ccc', fontWeight: 500 }}>{ok ? '✓' : '✗'}</span>
            )
            return (
              <div key={v.id} className="vehicle-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{v.immat}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{v.model}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <StatusBadge status={status} days={days} />
                  </div>
                </div>

                {v.conducteur && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    👤 {v.conducteur}{v.tel ? ` · ${v.tel}` : ''}
                  </div>
                )}

                {v.assurance && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    🛡 {v.assurance}{v.date_assurance ? ` · ${format(new Date(v.date_assurance), 'dd/MM/yyyy')}` : ''}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                    <span>{ck(v.ct_ok)} CT</span>
                    <span>{ck(v.cg_ok)} CG</span>
                    <span>{ck(v.entretien_ok)} Entretien</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => { setEditVehicle(v); setModalOpen(true) }}
                      style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-secondary)' }}
                    ><Pencil size={14} /></button>
                    <button
                      onClick={() => setDelId(v.id)}
                      style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 8, padding: '6px 10px', color: 'var(--danger)' }}
                    ><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <BottomNav alertCount={alertCount} />

      {modalOpen && (
        <VehicleModal
          vehicle={editVehicle}
          onClose={() => { setModalOpen(false); setEditVehicle(null) }}
          onSave={handleSave}
        />
      )}

      {delId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 340, textAlign: 'center' }} className="fade-in">
            <Trash2 size={28} style={{ color: 'var(--danger)', margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8 }}>Supprimer ce véhicule ?</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {vehicles.find(v => v.id === delId)?.immat} — {vehicles.find(v => v.id === delId)?.model}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setDelId(null)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid var(--border-strong)', background: 'transparent', fontSize: 14 }}>Annuler</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: 'var(--danger)', color: '#fff', fontSize: 14, fontWeight: 500 }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
