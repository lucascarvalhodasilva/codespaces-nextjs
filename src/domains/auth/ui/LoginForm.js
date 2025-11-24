'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'


export default function LoginForm({ onSwitchToRegister }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Login fehlgeschlagen')
        setLoading(false)
        return
      }

      // Erfolgreicher Login - redirect zur Hauptseite
      router.push('/')
      router.refresh()
    } catch (err) {
      setError('Ein Fehler ist aufgetreten')
      setLoading(false)
    }
  }

  return (
        <form onSubmit={submit} className="space-y-6">
      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-primary-light/80 mb-2">
          E-Mail oder Username
        </label>
        <input
          id="identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full px-4 py-3 bg-primary-darkest border border-primary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-primary-light placeholder-primary-light/30 transition-all"
          placeholder="name@example.com oder username"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-primary-light/80 mb-2">
          Passwort
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light placeholder-primary-light/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
        />
      </div>

      {error && (
        <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-darkest font-semibold rounded-lg transition-colors shadow-lg disabled:cursor-not-allowed"
      >
        {loading ? 'Wird angemeldet...' : 'Anmelden'}
      </button>

      <div className="text-center mt-4 text-sm text-primary-light/60">
        {onSwitchToRegister ? (
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary hover:text-primary/80"
          >
            Noch kein Konto? Jetzt registrieren
          </button>
        ) : (
          <p>
            New here?{' '}
            <Link href="/register" className="text-primary hover:text-primary/80">
              Create an account
            </Link>
          </p>
        )}
      </div>
    </form>
  )
}