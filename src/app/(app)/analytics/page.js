import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../../lib/auth.js'

export default async function AnalyticsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/landing')
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-light mb-2">Analytics</h1>
          <p className="text-primary-light/60">Detaillierte Einblicke in deine Trading-Performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-primary-dark rounded-xl border border-primary/30 p-6">
            <h2 className="text-xl font-semibold text-primary-light mb-4">Performance Overview</h2>
            <div className="flex items-center justify-center h-64 bg-primary-darkest/50 rounded-lg">
              <div className="text-center">
                <span className="text-5xl mb-2 block">📈</span>
                <p className="text-primary-light/60">Chart coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-primary-dark rounded-xl border border-primary/30 p-6">
            <h2 className="text-xl font-semibold text-primary-light mb-4">Win/Loss Ratio</h2>
            <div className="flex items-center justify-center h-64 bg-primary-darkest/50 rounded-lg">
              <div className="text-center">
                <span className="text-5xl mb-2 block">🎯</span>
                <p className="text-primary-light/60">Chart coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-primary-dark rounded-xl border border-primary/30 p-6">
            <h2 className="text-xl font-semibold text-primary-light mb-4">Monthly Performance</h2>
            <div className="flex items-center justify-center h-64 bg-primary-darkest/50 rounded-lg">
              <div className="text-center">
                <span className="text-5xl mb-2 block">📊</span>
                <p className="text-primary-light/60">Chart coming soon</p>
              </div>
            </div>
          </div>

          <div className="bg-primary-dark rounded-xl border border-primary/30 p-6">
            <h2 className="text-xl font-semibold text-primary-light mb-4">Asset Distribution</h2>
            <div className="flex items-center justify-center h-64 bg-primary-darkest/50 rounded-lg">
              <div className="text-center">
                <span className="text-5xl mb-2 block">🥧</span>
                <p className="text-primary-light/60">Chart coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
