import UserProfile from '@/domains/user/ui/UserProfile'

export const metadata = { title: 'User Profile' }

export default function UserPage() {
  return (
    <div style={{ padding: 32 }}>
      <h1>User Profile</h1>
      <UserProfile />
    </div>
  )
}