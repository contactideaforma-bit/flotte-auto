'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Car, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

export default function RegisterPage() {
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
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
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
      background: 'var(--bg-sidebar)',
      paddingTop: 'max(3rem, env(safe-area-inset-top))',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem',
          }}>
            <Car size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 500, color: '#fff', marginBottom: 6 }}>Flotte auto</h1>
          <p style={{ fontSize: 14, color: 'var(--text-sidebar)' }}>Mymy la King 👑</p>
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: '1.75rem' }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: '1.5rem' }}>Créer un compte</h2>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" required autoComplete="email" placeholder="vous@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Mot de passe</label>
              <input type="password" required autoComplete="new-password" placeholder="Minimum 6 caractères" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Confirmer</label>
              <input type="password" required autoComplete="new-password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} />
            </div>

            {error && (
              <div style={{ fontSize: 13, color: 'var(--danger)', background: 'var(--danger-light)', padding: '10px 14px', borderRadius: 10 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px', borderRadius: 12, border: 'none',
              background: 'var(--accent)', color: '#fff',
              fontSize: 16, fontWeight: 500,
              opacity: loading ? 0.7 : 1, marginTop: 4,
            }}>
              <UserPlus size={18} />
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1.5rem' }}>
            Déjà un compte ?{' '}
            <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
