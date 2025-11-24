export default function UserProfile({ user }) {
  if (!user) {
    return (
      <div>
        <p><strong>Username:</strong> –</p>
        <p><strong>Status:</strong> Nicht angemeldet</p>
      </div>
    )
  }

  return (
    <div>
      <p><strong>Username:</strong> {user.username || '—'}</p>
      <p><strong>E-Mail:</strong> {user.email}</p>
      <p><strong>Mitglied seit:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  )
}