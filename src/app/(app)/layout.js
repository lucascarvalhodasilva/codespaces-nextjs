import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../lib/auth.js'
import AppNav from './AppNav'
import ToastProvider from '../../shared/ui/ToastProvider'
import ConfirmationProvider from '../../shared/ui/ConfirmationProvider'

export default async function AppLayout({ children }) {
  const user = await getCurrentUser()

  // Wenn nicht eingeloggt, redirect zur Landing-Page
  if (!user) {
    redirect('/landing')
  }

  return (
    <ToastProvider>
      <ConfirmationProvider>
        <div className="flex min-h-screen bg-primary-darkest">
          <AppNav user={user} />
          <main className="flex-1 ml-64 h-screen overflow-y-auto thin-scrollbar">
            {children}
          </main>
        </div>
      </ConfirmationProvider>
    </ToastProvider>
  )
}
