import RegisterForm from '@/domains/auth/ui/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-primary-darkest flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-primary-dark rounded-lg shadow-lg p-8 border border-primary">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-light mb-2">Registrieren</h1>
            <p className="text-primary-light/60">Erstelle dein Konto</p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
