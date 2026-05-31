'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Car, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--bg-sidebar)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            <Car size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Flotte auto</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Mymy la King 👑</p>
        </div>

        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '1.75rem',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, marginBottom: '1.25rem' }}>Connexion</h2>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Email</label>
              <input type="email" required autoFocus placeholder="vous@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Mot de passe</label>
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            {error && (
              <div style={{ fontSize: 12, color: 'var(--danger)', background: 'var(--danger-light)', padding: '8px 12px', borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px', borderRadius: 9, border: 'none',
              background: 'var(--accent)', color: '#fff',
              fontSize: 14, fontWeight: 500, cursor: 'pointer',
              opacity: loading ? 0.7 : 1, marginTop: 4,
            }}>
              <LogIn size={16} />
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginTop: '1.25rem' }}>
            Pas encore de compte ?{' '}
            <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
