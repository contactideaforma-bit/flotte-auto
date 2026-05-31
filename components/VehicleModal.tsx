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
      const { id, created_at, updated_at, ...rest } = vehicle
      setForm(rest)
    } else {
      setForm(empty)
    }
  }, [vehicle])

  const set = (k: keyof VehicleInsert, v: unknown) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.immat.trim() || !form.model.trim()) return
    setLoading(true)
    await onSave(form)
    setLoading(false)
  }

  const field = (label: string, key: keyof VehicleInsert, type = 'text', placeholder = '') => (
    <div>
      <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{label}</label>
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
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '2rem 1rem', overflowY: 'auto', zIndex: 1000,
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 14,
        border: '1px solid var(--border)',
        width: 580, maxWidth: '100%', padding: '1.5rem',
      }} className="fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>
            {vehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: 4, borderRadius: 6 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {field('Immatriculation *', 'immat', 'text', 'AB-123-CD')}
          {field('Modèle *', 'model', 'text', 'Peugeot 308')}
          {field('Assurance', 'assurance', 'text', 'AXA, MAIF...')}
          {field('Date souscription', 'date_assurance', 'date')}
          {field('Date sinistre', 'date_sinistre', 'date')}
          {field('Conducteur', 'conducteur', 'text', 'Jean Dupont')}
          {field('Téléphone', 'tel', 'tel', '06 00 00 00 00')}
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Commentaire</label>
            <textarea
              rows={2}
              placeholder="Notes libres..."
              value={form.commentaire || ''}
              onChange={e => set('commentaire', e.target.value || null)}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ gridColumn: '1/-1', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '8px 0' }}>
            {([['ct_ok', 'Contrôle technique à jour'], ['cg_ok', 'Carte grise à jour'], ['entretien_ok', 'Entretien à jour']] as [keyof VehicleInsert, string][]).map(([k, label]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!form[k]}
                  onChange={e => set(k, e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-strong)',
            background: 'transparent', fontSize: 13, color: 'var(--text-primary)',
          }}>Annuler</button>
          <button onClick={handleSubmit} disabled={loading} style={{
            padding: '8px 22px', borderRadius: 8, border: 'none',
            background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500,
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
