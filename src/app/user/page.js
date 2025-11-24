import UserProfile from '@/domains/user/ui/UserProfile'
import { getCurrentUser } from '../../../lib/auth'

export const metadata = { title: 'User Profile' }

export default async function UserPage() {
  const user = await getCurrentUser()

  return (
    <div style={{ padding: 32 }}>
      <h1>User Profile</h1>
      <UserProfile user={user} />
    </div>
  )
}