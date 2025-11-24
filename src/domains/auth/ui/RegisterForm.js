'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterForm({ onSwitchToLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const normalizedUsername = username.trim()
    const usernamePattern = /^[a-zA-Z0-9._-]{3,32}$/

    if (!usernamePattern.test(normalizedUsername)) {
      setError('Benutzername muss 3-32 Zeichen haben und darf nur Buchstaben, Zahlen, Punkte, Unterstriche oder Bindestriche enthalten')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: normalizedUsername, email, password })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Registrierung fehlgeschlagen')
        setLoading(false)
        return
      }

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
        <label htmlFor="username" className="block text-sm font-medium text-primary-light/80 mb-2">
          Benutzername
        </label>
        <input
          id="username"
          type="text"
          placeholder="z. B. trader-lisa"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full px-4 py-3 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light placeholder-primary-light/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-primary-light/80 mb-2">
          E-Mail
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light placeholder-primary-light/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
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
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light placeholder-primary-light/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary-light/80 mb-2">
          Passwort bestätigen
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
        {loading ? 'Wird registriert...' : 'Konto erstellen'}
      </button>

      <div className="text-center mt-4 text-sm text-primary-light/60">
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:text-primary/80"
          >
            Bereits ein Konto? Jetzt anmelden
          </button>
        ) : (
          <p>
            Bereits ein Konto?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80">
              Jetzt anmelden
            </Link>
          </p>
        )}
      </div>
    </form>
  )
}
