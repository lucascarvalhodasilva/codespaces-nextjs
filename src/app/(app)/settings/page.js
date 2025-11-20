import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../../lib/auth.js'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/landing')
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-light mb-2">Settings</h1>
          <p className="text-primary-light/60">Verwalte deine Account-Einstellungen</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-primary-dark rounded-xl border border-primary/30 p-6">
            <h2 className="text-xl font-semibold text-primary-light mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-light/80 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light/60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-light/80 mb-2">
                  Member Since
                </label>
                <input
                  type="text"
                  value={new Date(user.createdAt).toLocaleDateString('de-DE', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  disabled
                  className="w-full px-4 py-3 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light/60 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-primary-dark rounded-xl border border-primary/30 p-6">
            <h2 className="text-xl font-semibold text-primary-light mb-4">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary-darkest/50 rounded-lg border border-primary/20">
                <div>
                  <p className="text-primary-light font-medium">Email Notifications</p>
                  <p className="text-sm text-primary-light/60">Receive updates about your trades</p>
                </div>
                <button className="px-4 py-2 bg-primary/20 text-primary-light rounded-lg hover:bg-primary/30 transition-colors">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-primary-darkest/50 rounded-lg border border-primary/20">
                <div>
                  <p className="text-primary-light font-medium">Dark Mode</p>
                  <p className="text-sm text-primary-light/60">Toggle dark/light theme</p>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-darkest font-semibold rounded-lg">
                  Active
                </button>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-primary-dark rounded-xl border border-primary/30 p-6">
            <h2 className="text-xl font-semibold text-primary-light mb-4">Security</h2>
            <button className="px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary-light font-semibold rounded-lg transition-colors">
              Change Password
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-900/20 rounded-xl border border-red-500/30 p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
            <p className="text-primary-light/60 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
