'use client'
import { useMemo, useState } from 'react'
import StrategyCard from './StrategyCard'
import NewStrategyModal from './NewStrategyModal'
import { useToast } from '../../../shared/ui/ToastProvider'
import { useConfirmation } from '../../../shared/ui/ConfirmationProvider'

export default function StrategiesClient({ strategies: initialStrategies }) {
  const [showNewModal, setShowNewModal] = useState(false)
  const [strategies, setStrategies] = useState(initialStrategies)
  const [sidebarStrategyId, setSidebarStrategyId] = useState(null)
  const [sidebarActionLoading, setSidebarActionLoading] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('desc')
  const { push: pushToast } = useToast()
  const confirm = useConfirmation()

  const sidebarStrategy = useMemo(
    () => strategies.find((strategy) => strategy.id === sidebarStrategyId) ?? null,
    [strategies, sidebarStrategyId]
  )

  const filteredStrategies = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()

    const matchesSearch = (strategy) => {
      if (!term) return true
      return strategy.name?.toLowerCase().includes(term)
    }

    const matchesStatus = (strategy) => {
      if (statusFilter === 'all') return true
      const isActive = Boolean(strategy.isActive)
      return statusFilter === 'active' ? isActive : !isActive
    }

    return [...strategies]
      .filter((strategy) => matchesSearch(strategy) && matchesStatus(strategy))
      .sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime()
        const bDate = new Date(b.createdAt).getTime()
        return sortOrder === 'asc' ? aDate - bDate : bDate - aDate
      })
  }, [strategies, searchQuery, statusFilter, sortOrder])

  const handleCreated = (strategy) => {
    const newStrategy = { ...strategy, __isNew: true }
    setStrategies(prev => [newStrategy, ...prev])
    pushToast(`Created strategy: ${strategy.name}`, { type: 'success' })
    setShowNewModal(false)
  }

  const handleUpdated = (updated) => {
    setStrategies(prev => prev.map(s => s.id === updated.id ? { ...updated, __isNew: false } : s))
    pushToast(`Updated strategy: ${updated.name}`, { type: 'success' })
  }

  const handleDeleted = (deletedId, name) => {
    setStrategies(prev => prev.filter(s => s.id !== deletedId))
    pushToast(`Deleted strategy: ${name}`, { type: 'warn' })
  }

  const openSidebar = (strategyId) => {
    setSidebarStrategyId(strategyId)
  }

  const closeSidebar = () => {
    setSidebarStrategyId(null)
    setSidebarActionLoading(null)
  }

  const handleDeactivated = async (strategyId) => {
    const target = strategies.find((s) => s.id === strategyId)
    if (!target) {
      pushToast('Strategy not found', { type: 'error' })
      return
    }
    if (!target.isActive) {
      pushToast(`${target.name} is already inactive`, { type: 'info' })
      return false
    }

    try {
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: 0 })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.success === false || !data.data) {
        throw new Error(data.message || 'Failed to deactivate strategy')
      }

      const updatedStrategy = { ...data.data, __isNew: false }

      setStrategies((prev) => prev.map((strategy) => (
        strategy.id === strategyId ? updatedStrategy : strategy
      )))

      pushToast(`Deactivated strategy: ${updatedStrategy.name}`, { type: 'success' })
      return true
    } catch (error) {
      console.error(error)
      pushToast(error.message || 'Failed to deactivate strategy', { type: 'error' })
      return false
    }
  }

  const handleDeleteStrategy = async (strategyId) => {
    const target = strategies.find((s) => s.id === strategyId)
    if (!target) {
      pushToast('Strategy not found', { type: 'error' })
      return false
    }

    const approved = await confirm({
      title: 'Delete strategy?',
      message: 'This will permanently remove the strategy and all notes.',
      details: target.name,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      tone: 'danger'
    })

    if (!approved) return false

    try {
      const response = await fetch(`/api/strategies/${strategyId}`, { method: 'DELETE' })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to delete strategy')
      }

      setStrategies((prev) => prev.filter((strategy) => strategy.id !== strategyId))
      pushToast(`Deleted strategy: ${target.name}`, { type: 'warn' })

      return true
    } catch (error) {
      console.error(error)
      pushToast(error.message || 'Failed to delete strategy', { type: 'error' })
      return false
    }
  }

  const handleSidebarDeactivate = async () => {
    if (!sidebarStrategy) return
    setSidebarActionLoading('deactivate')
    await handleDeactivated(sidebarStrategy.id)
    setSidebarActionLoading(null)
  }

  const handleSidebarDelete = async () => {
    if (!sidebarStrategy) return
    setSidebarActionLoading('delete')
    const success = await handleDeleteStrategy(sidebarStrategy.id)
    setSidebarActionLoading(null)
    if (success) {
      closeSidebar()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary-light mb-2">Strategies</h1>
          <p className="text-primary-light/60">Entwickle und teste deine Trading-Strategien</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-darkest font-semibold rounded-lg transition-colors"
        >
          + New Strategy
        </button>
      </div>

      {strategies.length > 0 ? (
        <>
          <div className="mb-4 rounded-2xl bg-primary-darkest/40 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex-1 flex flex-col gap-2 text-sm text-primary-light/60">
              <span className="text-xs uppercase tracking-[0.3em] text-primary-light/40">Search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by strategy name"
                className="w-full px-3 py-2 rounded-lg bg-primary-darkest border border-primary/30 text-primary-light focus:outline-none focus:border-primary"
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <label className="text-xs uppercase tracking-[0.3em] text-primary-light/40 flex flex-col gap-2">
                Status
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-primary-darkest border border-primary/30 text-primary-light focus:outline-none focus:border-primary text-sm"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="text-xs uppercase tracking-[0.3em] text-primary-light/40 flex flex-col gap-2">
                Order by
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-primary-darkest border border-primary/30 text-primary-light focus:outline-none focus:border-primary text-sm"
                >
                  <option value="desc">Newest first</option>
                  <option value="asc">Oldest first</option>
                </select>
              </label>
            </div>
          </div>

          {filteredStrategies.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {filteredStrategies.map(strategy => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                  onShowDetails={openSidebar}
                />
              ))}
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-primary/20 bg-primary-darkest/40 p-8 text-center text-primary-light/60">
              No strategies match your filters.
            </div>
          )}
        </>
      ) : (
        <div className="bg-primary-dark rounded-xl border border-primary/30 p-8">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🎯</span>
            <h2 className="text-2xl font-bold text-primary-light mb-2">Create Your First Strategy</h2>
            <p className="text-primary-light/60 mb-6">
              Document your trading rules, test them, and track their performance over time
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-darkest font-semibold rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {showNewModal && (
        <NewStrategyModal onClose={() => setShowNewModal(false)} onCreated={handleCreated} />
      )}

      {sidebarStrategy && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={closeSidebar}
          />
          <aside className="fixed inset-y-0 right-0 w-full max-w-md bg-primary-darkest border-l border-primary/30 z-50 shadow-2xl flex flex-col">
            <div className="flex items-start justify-between p-6 border-b border-primary/20">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary-light/50 mb-1">Strategy</p>
                <h2 className="text-2xl font-semibold text-primary-light">{sidebarStrategy.name}</h2>
                <p className="text-sm text-primary-light/60">
                  {sidebarStrategy.isActive ? 'Active' : 'Inactive'} • Created{' '}
                  {new Date(sidebarStrategy.createdAt).toLocaleDateString('de-DE')}
                </p>
              </div>
              <button
                type="button"
                onClick={closeSidebar}
                className="p-2 rounded-full text-primary-light/60 hover:text-primary-light hover:bg-primary/10"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <button
                type="button"
                onClick={handleSidebarDeactivate}
                disabled={!sidebarStrategy.isActive || sidebarActionLoading === 'deactivate'}
                className="w-full px-4 py-3 rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/40 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sidebarStrategy.isActive
                  ? (sidebarActionLoading === 'deactivate' ? 'Deactivating…' : 'Deactivate strategy')
                  : 'Already inactive'}
              </button>
              <button
                type="button"
                onClick={handleSidebarDelete}
                disabled={sidebarActionLoading === 'delete'}
                className="w-full px-4 py-3 rounded-lg bg-red-600/20 text-red-200 border border-red-600/40 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sidebarActionLoading === 'delete' ? 'Deleting…' : 'Delete strategy'}
              </button>
            </div>

            <div className="mt-auto p-6 text-xs text-primary-light/50 border-t border-primary/20">
              More insights & statistics coming soon.
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
