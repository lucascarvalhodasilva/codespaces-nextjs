import { redirect } from 'next/navigation'

export default function AppIndex() {
  // Redirect zur Dashboard-Seite
  redirect('/dashboard')
}
