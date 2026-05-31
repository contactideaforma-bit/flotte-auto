'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { format } from 'date-fns'
import BottomNav from '@/components/BottomNav'
import VehicleModal from '@/components/VehicleModal'
import StatusBadge from '@/components/StatusBadge'
import { Vehicle, VehicleInsert } from '@/lib/supabase'
import { getDaysUntilAlert, getAlertStatus } from '@/lib/utils'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)
  const [delId, setDelId] = useState<string | null>(null)

  const fetchVehicles = useCallback(async () => {
    const res = await window.fetch('/api/vehicles')
    const data = await res.json()
    setVehicles(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

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

  const filtered = vehicles.filter(v =>
    v.immat.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    (v.conducteur || '').toLowerCase().includes(search.toLowerCase())
  )

  const alertCount = vehicles.filter(v => { const d = getDaysUntilAlert(v); return d !== null && d <= 10 }).length

  const ck = (ok: boolean) => (
    <span style={{ fontSize: 13, color: ok ? 'var(--ok)' : '#ccc', fontWeight: 500 }}>{ok ? '✓' : '✗'}</span>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* Header */}
      <header style={{
        background: 'var(--bg-sidebar)',
        padding: '1.25rem',
        paddingTop: 'max(3rem, calc(env(safe-area-inset-top) + 1.25rem))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>Véhicules</h1>
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

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Rechercher immat, modèle, conducteur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 36, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: 10 }}
          />
        </div>
      </header>

      <div style={{ padding: '1rem', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 8 }}>

        <div style={{ fontSize: 12, color: 'var(--text-secondary)', paddingLeft: 2, marginBottom: 4 }}>
          {filtered.length} véhicule{filtered.length > 1 ? 's' : ''}{search ? ` pour "${search}"` : ''}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', fontSize: 13, color: 'var(--text-secondary)' }}>Chargement…</div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '2.5rem', textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
            {search ? 'Aucun résultat' : 'Aucun véhicule — appuyez sur "Ajouter"'}
          </div>
        )}

        {filtered.map(v => {
          const status = getAlertStatus(v)
          const days = getDaysUntilAlert(v)
          return (
            <div key={v.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{v.immat}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{v.model}</div>
                </div>
                <StatusBadge status={status} days={days} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                {v.conducteur && <div>👤 {v.conducteur}</div>}
                {v.tel && <div>📞 {v.tel}</div>}
                {v.assurance && <div>🛡 {v.assurance}</div>}
                {v.date_assurance && <div>📅 {format(new Date(v.date_assurance), 'dd/MM/yyyy')}</div>}
                {v.date_sinistre && <div>⚠️ Sinistre : {format(new Date(v.date_sinistre), 'dd/MM/yyyy')}</div>}
              </div>

              {v.commentaire && (
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-base)', borderRadius: 8, padding: '8px 10px' }}>
                  💬 {v.commentaire}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                  <span>{ck(v.ct_ok)} CT</span>
                  <span>{ck(v.cg_ok)} CG</span>
                  <span>{ck(v.entretien_ok)} Entretien</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => { setEditVehicle(v); setModalOpen(true) }}
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 11px', color: 'var(--text-secondary)' }}>
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDelId(v.id)}
                    style={{ background: 'var(--danger-light)', border: '1px solid var(--danger)', borderRadius: 8, padding: '7px 11px', color: 'var(--danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
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
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 340, textAlign: 'center' }}>
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
