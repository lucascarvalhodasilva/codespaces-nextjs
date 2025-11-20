import LoginForm from '@/domains/auth/ui/LoginForm'

export const metadata = { title: 'Auth' }

export default function AuthPage() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Login / Signup</h1>
      <LoginForm />
    </div>
  )
}