import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../lib/auth.js'
import LoginForm from '@/domains/auth/ui/LoginForm'

export default async function LoginPage() {
  const user = await getCurrentUser()

  // Wenn bereits eingeloggt, redirect zur Hauptseite (die dann zum Dashboard leitet)
  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-primary-darkest flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-primary-dark rounded-lg shadow-lg p-8 border border-primary">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-light mb-2">Login</h1>
            <p className="text-primary-light/60">Melde dich an, um fortzufahren</p>
          </div>
          
          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-primary-light/60 text-sm">
              Noch kein Konto?{' '}
              <a href="/register" className="text-primary hover:text-primary-light transition-colors font-semibold">
                Jetzt registrieren
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
