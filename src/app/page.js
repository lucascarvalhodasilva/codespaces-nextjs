import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../lib/auth'

export default async function Home() {
  // Check if user is authenticated
  const user = await getCurrentUser()
  
  // If not authenticated, redirect to landing page
  if (!user) {
    redirect('/landing')
  }
  
  // If authenticated, redirect to app (which then redirects to dashboard)
  redirect('/dashboard')
}