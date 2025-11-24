'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AppNav({ user }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await fetch('/api/logout', {
        method: 'POST'
      })
      router.push('/landing')
      router.refresh()
    } catch (err) {
      console.error('Logout failed:', err)
      setIsLoggingOut(false)
    }
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/trades', label: 'Trades', icon: '💰' },
    { href: '/analytics', label: 'Analytics', icon: '📈' },
    { href: '/journal', label: 'Journal', icon: '📝' },
    { href: '/strategies', label: 'Strategies', icon: '🎯' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-primary-dark border-r border-primary/30 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-primary/30">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-primary-light font-bold text-lg">SimpleTrade</h1>
            <p className="text-primary-light/60 text-xs">Track. Analyze. Win.</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-primary/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-primary-light font-semibold text-lg">
              {user.email[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-primary-light font-medium text-sm truncate">{user.email}</p>
            <p className="text-primary-light/60 text-xs">Active Trader</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
  <div className="flex-1 py-6 overflow-y-auto thin-scrollbar">
        <div className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-primary-darkest font-semibold shadow-lg'
                    : 'text-primary-light/70 hover:bg-primary/10 hover:text-primary-light'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-primary/30">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </span>
        </button>
      </div>
    </nav>
  )
}
