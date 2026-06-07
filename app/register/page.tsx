'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Car, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 6) { setError('Minimum 6 caractères'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
        data: { display_name: displayName.trim() || email.split('@')[0] },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-base)',
      paddingTop: 'max(3rem, env(safe-area-inset-top))',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glows décoratifs */}
      <div style={{
        position: 'absolute', top: -100, right: -100,
        width: 400, height: 400,
        background: 'radial-gradient(ellipse, rgba(155,0,255,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60,
        width: 350, height: 350,
        background: 'radial-gradient(ellipse, rgba(233,30,140,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: 'var(--glow-pink)',
          }}>
            <Car size={28} color="#fff" />
          </div>
          <h1 style={{
            fontSize: 20, fontWeight: 700, color: '#fff',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.1em',
            textShadow: '0 0 20px rgba(233,30,140,0.5)',
          }}>FLOTTE AUTO</h1>
        </div>

        {/* Carte register */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 20,
          padding: '1.75rem',
          border: '1px solid var(--border-strong)',
          boxShadow: '0 8px 40px rgba(155,0,255,0.15)',
        }}>
          <h2 style={{
            fontSize: 14, fontWeight: 700, marginBottom: '1.5rem',
            color: 'var(--text-primary)', letterSpacing: '0.08em',
            fontFamily: 'var(--font-display)',
          }}>
            CRÉER UN COMPTE
          </h2>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Nom d&apos;affichage</label>
              <input type="text" autoComplete="name" placeholder="Votre prénom ou pseudo" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email</label>
              <input type="email" required autoComplete="email" placeholder="vous@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Mot de passe</label>
              <input type="password" required autoComplete="new-password" placeholder="Minimum 6 caractères" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Confirmer</label>
              <input type="password" required autoComplete="new-password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>

            {error && (
              <div style={{
                fontSize: 13, color: 'var(--danger)',
                background: 'var(--danger-light)',
                border: '1px solid rgba(255,45,85,0.3)',
                padding: '10px 14px', borderRadius: 10,
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent2) 100%)',
              color: '#fff', fontSize: 14, fontWeight: 700,
              letterSpacing: '0.06em',
              opacity: loading ? 0.7 : 1, marginTop: 4,
              boxShadow: loading ? 'none' : 'var(--glow-sm)',
              transition: 'box-shadow 0.2s, opacity 0.2s',
            }}>
              <UserPlus size={18} />
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1.5rem' }}>
            Déjà un compte ?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
