'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserCircle, KeyRound, Mail, User, Check, X, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import BottomNav from '@/components/BottomNav'
import Sidebar from '@/components/Sidebar'

type Section = 'name' | 'email' | 'password' | null

export default function ProfilePage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>(null)

  // Champs édition
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // State feedback
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUserEmail(data.user.email || '')
      const name = data.user.user_metadata?.display_name || ''
      setDisplayName(name)
      setNewName(name)
      setNewEmail(data.user.email || '')
    })
  }, [router])

  const clearFeedback = () => { setSuccess(''); setError('') }

  const openSection = (s: Section) => {
    setActiveSection(s)
    clearFeedback()
  }

  // ── Changer le nom ──────────────────────────────────────
  const handleSaveName = async () => {
    if (!newName.trim()) { setError('Le nom ne peut pas être vide'); return }
    setLoading(true); clearFeedback()
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ data: { display_name: newName.trim() } })
    setLoading(false)
    if (err) { setError(err.message); return }
    setDisplayName(newName.trim())
    setSuccess('Nom mis à jour !')
    setActiveSection(null)
  }

  // ── Changer l'email ─────────────────────────────────────
  const handleSaveEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) { setError('Email invalide'); return }
    setLoading(true); clearFeedback()
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ email: newEmail.trim() })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess('Un email de confirmation a été envoyé à ' + newEmail)
    setActiveSection(null)
  }

  // ── Changer le mot de passe ─────────────────────────────
  const handleSavePassword = async () => {
    if (newPassword.length < 6) { setError('Minimum 6 caractères'); return }
    if (newPassword !== confirmPassword) { setError('Les mots de passe ne correspondent pas'); return }
    setLoading(true); clearFeedback()
    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSuccess('Mot de passe mis à jour !')
    setNewPassword(''); setConfirmPassword('')
    setActiveSection(null)
  }

  const labelStyle = {
    fontSize: 11, color: 'var(--text-secondary)',
    display: 'block', marginBottom: 6,
    letterSpacing: '0.06em', textTransform: 'uppercase' as const,
  }
  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 16, padding: '1.25rem',
    marginBottom: '1rem',
    transition: 'border-color 0.2s',
  }
  const rowStyle = {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
  }

  const EditButton = ({ section }: { section: Section }) => (
    <button
      onClick={() => openSection(activeSection === section ? null : section)}
      style={{
        fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
        padding: '6px 14px', borderRadius: 8, border: 'none',
        background: activeSection === section ? 'var(--accent-light)' : 'rgba(155,0,255,0.12)',
        color: activeSection === section ? 'var(--accent)' : 'var(--text-secondary)',
        cursor: 'pointer', transition: 'background 0.15s',
      }}
    >
      {activeSection === section ? 'Annuler' : 'Modifier'}
    </button>
  )

  const SaveButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} disabled={loading} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: '100%', padding: '13px', marginTop: 12,
      borderRadius: 12, border: 'none',
      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)',
      color: '#fff', fontSize: 14, fontWeight: 700,
      letterSpacing: '0.06em',
      opacity: loading ? 0.6 : 1,
      boxShadow: loading ? 'none' : 'var(--glow-sm)',
      cursor: loading ? 'not-allowed' : 'pointer',
    }}>
      <Check size={16} />
      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
    </button>
  )

  const content = (
    <div style={{ padding: '1.5rem 1rem', maxWidth: 480, margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--glow-sm)', flexShrink: 0,
        }}>
          <UserCircle size={28} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
            {displayName || 'Mon profil'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{userEmail}</div>
        </div>
      </div>

      {/* Feedback global */}
      {success && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, color: 'var(--ok)',
          background: 'var(--ok-light)',
          border: '1px solid rgba(0,229,160,0.25)',
          padding: '10px 14px', borderRadius: 10, marginBottom: '1rem',
        }}>
          <Check size={15} /> {success}
        </div>
      )}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 13, color: 'var(--danger)',
          background: 'var(--danger-light)',
          border: '1px solid rgba(255,45,85,0.25)',
          padding: '10px 14px', borderRadius: 10, marginBottom: '1rem',
        }}>
          <X size={15} /> {error}
        </div>
      )}

      {/* ── Section Nom ── */}
      <div style={{ ...cardStyle, borderColor: activeSection === 'name' ? 'var(--accent)' : 'var(--border)' }}>
        <div style={rowStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <User size={18} style={{ color: 'var(--accent)' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Nom d&apos;affichage</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{displayName || '—'}</div>
            </div>
          </div>
          <EditButton section="name" />
        </div>
        {activeSection === 'name' && (
          <div style={{ marginTop: '1rem' }}>
            <label style={labelStyle}>Nouveau nom</label>
            <input
              type="text" value={newName}
              onChange={e => { setNewName(e.target.value); clearFeedback() }}
              placeholder="Votre prénom ou pseudo"
              autoFocus
            />
            <SaveButton onClick={handleSaveName} />
          </div>
        )}
      </div>

      {/* ── Section Email ── */}
      <div style={{ ...cardStyle, borderColor: activeSection === 'email' ? 'var(--accent)' : 'var(--border)' }}>
        <div style={rowStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mail size={18} style={{ color: 'var(--accent2)' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Adresse email</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{userEmail}</div>
            </div>
          </div>
          <EditButton section="email" />
        </div>
        {activeSection === 'email' && (
          <div style={{ marginTop: '1rem' }}>
            <label style={labelStyle}>Nouvel email</label>
            <input
              type="email" value={newEmail}
              onChange={e => { setNewEmail(e.target.value); clearFeedback() }}
              placeholder="nouveau@email.com"
              autoFocus
            />
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>
              Un email de confirmation sera envoyé à la nouvelle adresse.
            </p>
            <SaveButton onClick={handleSaveEmail} />
          </div>
        )}
      </div>

      {/* ── Section Mot de passe ── */}
      <div style={{ ...cardStyle, borderColor: activeSection === 'password' ? 'var(--accent)' : 'var(--border)' }}>
        <div style={rowStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <KeyRound size={18} style={{ color: 'var(--warn)' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Mot de passe</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>••••••••</div>
            </div>
          </div>
          <EditButton section="password" />
        </div>
        {activeSection === 'password' && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nouveau mot de passe</label>
              <input
                type="password" value={newPassword}
                onChange={e => { setNewPassword(e.target.value); clearFeedback() }}
                placeholder="Minimum 6 caractères"
                autoFocus
              />
            </div>
            <div>
              <label style={labelStyle}>Confirmer</label>
              <input
                type="password" value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); clearFeedback() }}
                placeholder="••••••••"
              />
            </div>
            <SaveButton onClick={handleSavePassword} />
          </div>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
        {/* Header mobile */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(9,0,22,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-strong)',
          padding: '1rem',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button onClick={() => router.back()} style={{
            background: 'none', border: 'none', color: 'var(--accent)',
            cursor: 'pointer', padding: 4,
          }}>
            <ArrowLeft size={22} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
            PROFIL
          </span>
        </div>
        <div className="page-content">{content}</div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar userEmail={userEmail} displayName={displayName} />
      <main style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
        <h1 style={{
          fontSize: 20, fontWeight: 700, marginBottom: '1.5rem',
          fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
          color: 'var(--text-primary)',
        }}>
          MON PROFIL
        </h1>
        {content}
      </main>
    </div>
  )
}
