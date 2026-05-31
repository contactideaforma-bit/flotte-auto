'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Vehicle, VehicleInsert } from '@/lib/supabase'

type Props = {
  vehicle?: Vehicle | null
  onClose: () => void
  onSave: (v: VehicleInsert) => Promise<void>
}

const empty: VehicleInsert = {
  immat: '', model: '', assurance: null, date_assurance: null,
  date_sinistre: null, conducteur: null, tel: null, commentaire: null,
  ct_ok: false, cg_ok: false, entretien_ok: false,
}

export default function VehicleModal({ vehicle, onClose, onSave }: Props) {
  const [form, setForm] = useState<VehicleInsert>(empty)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (vehicle) {
      const { id, created_at, updated_at, user_id, ...rest } = vehicle as Vehicle & { user_id?: string }
      setForm(rest)
    } else {
      setForm(empty)
    }
  }, [vehicle])

  const set = (k: keyof VehicleInsert, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.immat.trim() || !form.model.trim()) return
    setLoading(true)
    await onSave(form)
    setLoading(false)
  }

  const field = (label: string, key: keyof VehicleInsert, type = 'text', placeholder = '') => (
    <div>
      <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={(form[key] as string) || ''}
        onChange={e => set(key, e.target.value || null)}
      />
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      zIndex: 300, display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px 20px 0 0',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '1.25rem 1.25rem',
        paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
      }} className="fade-in">

        {/* Handle */}
        <div style={{ width: 36, height: 4, background: 'var(--border-strong)', borderRadius: 4, margin: '0 auto 1.25rem' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: 17, fontWeight: 500 }}>
            {vehicle ? 'Modifier' : 'Ajouter un véhicule'}
          </span>
          <button onClick={onClose} style={{ background: 'var(--bg-base)', border: 'none', borderRadius: 20, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {field('Immatriculation *', 'immat', 'text', 'AB-123-CD')}
          {field('Modèle *', 'model', 'text', 'Peugeot 308')}
          {field('Assurance', 'assurance', 'text', 'AXA, MAIF...')}
          {field('Date souscription', 'date_assurance', 'date')}
          {field('Date sinistre', 'date_sinistre', 'date')}
          {field('Conducteur', 'conducteur', 'text', 'Jean Dupont')}
          {field('Téléphone', 'tel', 'tel', '06 00 00 00 00')}
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Commentaire</label>
            <textarea rows={3} placeholder="Notes libres..." value={form.commentaire || ''} onChange={e => set('commentaire', e.target.value || null)} style={{ resize: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0' }}>
            {([['ct_ok', 'Contrôle technique à jour'], ['cg_ok', 'Carte grise à jour'], ['entretien_ok', 'Entretien à jour']] as [keyof VehicleInsert, string][]).map(([k, label]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, cursor: 'pointer', padding: '4px 0' }}>
                <input type="checkbox" checked={!!form[k]} onChange={e => set(k, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{
            padding: '15px', borderRadius: 12, border: 'none',
            background: 'var(--accent)', color: '#fff',
            fontSize: 16, fontWeight: 500, marginTop: 8,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
