import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../../lib/auth.js'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/landing')
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-primary-light mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-primary-dark rounded-xl p-6 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary-light/60 text-sm font-medium">Total Trades</span>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-3xl font-bold text-primary-light">24</p>
            <p className="text-primary text-sm mt-2">+12% from last month</p>
          </div>

          <div className="bg-primary-dark rounded-xl p-6 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary-light/60 text-sm font-medium">Win Rate</span>
              <span className="text-2xl">📈</span>
            </div>
            <p className="text-3xl font-bold text-primary-light">68%</p>
            <p className="text-primary text-sm mt-2">+5% from last month</p>
          </div>

          <div className="bg-primary-dark rounded-xl p-6 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary-light/60 text-sm font-medium">Total P&L</span>
              <span className="text-2xl">💵</span>
            </div>
            <p className="text-3xl font-bold text-primary-light">$2,847</p>
            <p className="text-primary text-sm mt-2">+24% from last month</p>
          </div>

          <div className="bg-primary-dark rounded-xl p-6 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary-light/60 text-sm font-medium">Active Days</span>
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-3xl font-bold text-primary-light">18</p>
            <p className="text-primary text-sm mt-2">This month</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-primary-dark rounded-xl p-6 border border-primary/30">
            <h2 className="text-xl font-semibold text-primary-light mb-4">Recent Trades</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-primary-darkest/50 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary-light font-medium">BTC/USDT</span>
                    <span className="text-primary text-sm font-semibold">+$245</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-primary-light/60">
                    <span>Long • 2 days ago</span>
                    <span>Win</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-primary hover:text-primary-light transition-colors text-sm font-medium">
              View all trades →
            </button>
          </div>

          <div className="bg-primary-dark rounded-xl p-6 border border-primary/30">
            <h2 className="text-xl font-semibold text-primary-light mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full bg-primary hover:bg-primary/90 text-primary-darkest font-semibold py-3 px-4 rounded-lg transition-colors">
                + Add New Trade
              </button>
              <button className="w-full bg-primary/20 hover:bg-primary/30 text-primary-light font-semibold py-3 px-4 rounded-lg transition-colors">
                📝 Write Journal Entry
              </button>
              <button className="w-full bg-primary/20 hover:bg-primary/30 text-primary-light font-semibold py-3 px-4 rounded-lg transition-colors">
                📊 View Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-6 bg-gradient-to-r from-primary-dark/50 to-primary/20 rounded-xl p-6 border border-primary/30">
          <h3 className="text-lg font-semibold text-primary-light mb-2">
            Welcome back, {user.email.split('@')[0]}! 👋
          </h3>
          <p className="text-primary-light/70">
            You&apos;ve been a member since {new Date(user.createdAt).toLocaleDateString('de-DE', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
