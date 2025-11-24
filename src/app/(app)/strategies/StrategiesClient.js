'use client'
import { useMemo, useState } from 'react'
import StrategyCard from './StrategyCard'
import NewStrategyModal from './NewStrategyModal'
import EditStrategyModal from './EditStrategyModal'
import ArchiveStrategyModal from './ArchiveStrategyModal'
import Select from '../../../shared/ui/Select'
import { useToast } from '../../../shared/ui/ToastProvider'
import { useConfirmation } from '../../../shared/ui/ConfirmationProvider'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
})

const emptyStats = {
  total: 0,
  open: 0,
  closed: 0,
  winRate: 0,
  totalPnl: 0,
  avgR: 0,
  lastTradeAt: null,
  topInstruments: []
}

const lastTradeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
})

export default function StrategiesClient({ strategies: initialStrategies, strategyStats = {} }) {
  const [showNewModal, setShowNewModal] = useState(false)
  const [strategies, setStrategies] = useState(initialStrategies)
  const [sidebarStrategyId, setSidebarStrategyId] = useState(null)
  const [sidebarActionLoading, setSidebarActionLoading] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('performance-desc')
  const [editingStrategy, setEditingStrategy] = useState(null)
  const [archivingStrategy, setArchivingStrategy] = useState(null)
  const { push: pushToast } = useToast()
  const confirm = useConfirmation()

  const sidebarStrategy = useMemo(
    () => strategies.find((strategy) => strategy.id === sidebarStrategyId) ?? null,
    [strategies, sidebarStrategyId]
  )

  const sidebarStats = sidebarStrategy
    ? (strategyStats?.[sidebarStrategy.id] ?? emptyStats)
    : emptyStats

  const lastTradeLabel = sidebarStats.lastTradeAt
    ? lastTradeFormatter.format(new Date(sidebarStats.lastTradeAt))
    : '—'

  const instrumentLeaders = sidebarStats.topInstruments ?? []

  const filteredStrategies = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()

    const matchesSearch = (strategy) => {
      if (!term) return true
      return strategy.name?.toLowerCase().includes(term)
    }

    const matchesStatus = (strategy) => {
      if (statusFilter === 'all') return true
      const isActive = Boolean(strategy.isActive)
      if (statusFilter === 'active') return isActive
      if (statusFilter === 'archived') return !isActive
      return true
    }

    const strategyPnl = (strategy) => strategyStats?.[strategy.id]?.totalPnl ?? 0

    return [...strategies]
      .filter((strategy) => matchesSearch(strategy) && matchesStatus(strategy))
      .sort((a, b) => {
        if (sortOrder === 'performance-desc') {
          const diff = strategyPnl(b) - strategyPnl(a)
          if (diff !== 0) return diff
        } else if (sortOrder === 'performance-asc') {
          const diff = strategyPnl(a) - strategyPnl(b)
          if (diff !== 0) return diff
        }

        const aDate = new Date(a.createdAt).getTime()
        const bDate = new Date(b.createdAt).getTime()
        if (sortOrder === 'created-asc') {
          return aDate - bDate
        }
        if (sortOrder === 'created-desc') {
          return bDate - aDate
        }

        // default fallback
        return bDate - aDate
      })
  }, [strategies, searchQuery, statusFilter, sortOrder, strategyStats])

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
    setArchivingStrategy(null)
  }

  const mutateStrategy = async (strategyId, payload, successMessage) => {
    try {
      const response = await fetch(`/api/strategies/${strategyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to update strategy')
      }

      const updated = data.data
      setStrategies(prev => prev.map((strategy) =>
        strategy.id === updated.id
          ? { ...strategy, ...updated, __isNew: false }
          : strategy
      ))

      if (successMessage) {
        pushToast(successMessage, { type: 'info' })
      }

      return updated
    } catch (error) {
      console.error(error)
      pushToast(error.message || 'Failed to update strategy', { type: 'error' })
      return null
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

  const handleSidebarArchive = () => {
    if (!sidebarStrategy) return
    setArchivingStrategy(sidebarStrategy)
  }

  const handleArchiveConfirm = async (reason) => {
    if (!archivingStrategy) return
    setSidebarActionLoading('archive')
    const result = await mutateStrategy(
      archivingStrategy.id,
      { isActive: 0, archivedReason: reason?.trim() || null },
      `Archived strategy: ${archivingStrategy.name}`
    )
    setSidebarActionLoading(null)
    if (result) {
      setArchivingStrategy(null)
    }
  }

  const handleArchiveCancel = () => {
    if (sidebarActionLoading === 'archive') return
    setArchivingStrategy(null)
  }

  const handleSidebarRestore = async () => {
    if (!sidebarStrategy) return
    setSidebarActionLoading('restore')
    await mutateStrategy(
      sidebarStrategy.id,
      { isActive: 1, archivedReason: null },
      `Restored strategy: ${sidebarStrategy.name}`
    )
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
      <header className="sticky top-0 z-30 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-primary-darkest/95 py-6 mb-8 shadow-lg">
        <div>
          <h1 className="text-4xl font-bold text-primary-light mb-2">Strategies</h1>
          <p className="text-primary-light/60">Entwickle und teste deine Trading-Strategien</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-darkest font-semibold rounded-lg transition-colors"
        >
          + New Strategy
        </button>
      </header>

      {strategies.length > 0 ? (
        <>
          <div className="mb-8 rounded-2xl bg-primary-darkest/40 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              <Select
                className="sm:min-w-[180px]"
                label={<span className="text-xs uppercase tracking-[0.3em] text-primary-light/40">Status</span>}
                value={statusFilter}
                onChange={(nextValue) => setStatusFilter(nextValue)}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Archived', value: 'archived' }
                ]}
              />
              <Select
                className="sm:min-w-[200px]"
                label={<span className="text-xs uppercase tracking-[0.3em] text-primary-light/40">Order by</span>}
                value={sortOrder}
                onChange={(nextValue) => setSortOrder(nextValue)}
                options={[
                  { label: 'Newest created', value: 'created-desc' },
                  { label: 'Oldest created', value: 'created-asc' },
                  { label: 'Most successful', value: 'performance-desc' },
                  { label: 'Least successful', value: 'performance-asc' }
                ]}
              />
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

      {editingStrategy && (
        <EditStrategyModal
          strategy={editingStrategy}
          onClose={() => setEditingStrategy(null)}
          onUpdated={(updated) => {
            handleUpdated(updated)
            setEditingStrategy(null)
          }}
          onDeleted={(id, name) => {
            handleDeleted(id, name)
            setEditingStrategy(null)
            if (sidebarStrategyId === id) {
              closeSidebar()
            }
          }}
        />
      )}

      {archivingStrategy && (
        <ArchiveStrategyModal
          strategy={archivingStrategy}
          onClose={handleArchiveCancel}
          onConfirm={handleArchiveConfirm}
          isSubmitting={sidebarActionLoading === 'archive'}
        />
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
                  {sidebarStrategy.isActive ? 'Active' : 'Archived'} • Created{' '}
                  {new Date(sidebarStrategy.createdAt).toLocaleDateString('de-DE')}
                </p>
                {!sidebarStrategy.isActive && sidebarStrategy.archivedReason && (
                  <p className="text-xs text-amber-200 mt-2">
                    Archived because: {sidebarStrategy.archivedReason}
                  </p>
                )}
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

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm text-primary-light/70">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-primary-light/40 mb-3">Performance Snapshot</p>
                <div className="grid grid-cols-2 gap-3">
                  <SidebarSnapshotStat
                    label="Net Realized PnL"
                    value={currencyFormatter.format(sidebarStats.totalPnl || 0)}
                    sub={`${sidebarStats.closed} closed trades`}
                    tone={sidebarStats.totalPnl > 0 ? 'positive' : sidebarStats.totalPnl < 0 ? 'negative' : 'neutral'}
                  />
                  <SidebarSnapshotStat
                    label="Win Rate"
                    value={`${Math.round(sidebarStats.winRate || 0)}%`}
                    sub={sidebarStats.closed ? `${sidebarStats.closed} closed` : 'No closed trades yet'}
                  />
                  <SidebarSnapshotStat
                    label="Avg R-Multiple"
                    value={`${(sidebarStats.avgR || 0).toFixed(2)} R`}
                    sub="Across closed trades"
                  />
                  <SidebarSnapshotStat
                    label="Total Trades"
                    value={sidebarStats.total}
                    sub={`${sidebarStats.open} open now`}
                  />
                  <SidebarSnapshotStat
                    label="Last Trade"
                    value={lastTradeLabel}
                    sub={sidebarStats.lastTradeAt ? 'Most recent entry' : 'No trades logged yet'}
                  />
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-primary-light/40 mb-3">Instrument Leaderboard</p>
                {instrumentLeaders.length > 0 ? (
                  <div className="space-y-2">
                    {instrumentLeaders.map((leader, index) => {
                      const tierClass = index === 0
                        ? 'border-yellow-400/70 hover:border-yellow-200'
                        : index === 1
                          ? 'border-gray-300/70 hover:border-gray-100'
                          : 'border-[#8c6239]/70 hover:border-[#c08552]'

                      return (
                        <div
                          key={`${leader.instrument}-${index}`}
                          className={`group rounded-lg border ${tierClass} bg-primary-darkest/30 px-3 py-2 flex items-center justify-between gap-3 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}
                        >
                        <div>
                            <p className="text-sm font-semibold text-primary-light flex items-center gap-2">
                              <span>{leader.instrument}</span>
                              <span className="text-[10px] uppercase tracking-[0.2em] text-primary-light/60 group-hover:text-primary-light/40 transform transition-transform duration-200 group-hover:scale-110">
                                #{index + 1}
                              </span>
                          </p>
                          <p className="text-[11px] text-primary-light/60">
                            {leader.trades} trades • {leader.winRate?.toFixed(0) ?? 0}% win rate
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary-light/90">
                            {currencyFormatter.format(leader.totalPnl || 0)}
                          </p>
                          <p className="text-[11px] text-primary-light/50">avg {currencyFormatter.format(leader.avgPnl || 0)}</p>
                        </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-primary-light/50">No instrument history for this strategy yet.</p>
                )}
              </div>
            </div>

            <div className="mt-auto">
              <div className="p-6 border-t border-primary/20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingStrategy(sidebarStrategy)}
                    className="px-4 py-2 rounded-lg border border-primary/40 text-primary-light hover:border-primary/70"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={sidebarStrategy.isActive ? handleSidebarArchive : handleSidebarRestore}
                    disabled={sidebarActionLoading === 'archive' || sidebarActionLoading === 'restore' || Boolean(archivingStrategy)}
                    className={`px-4 py-2 rounded-lg border font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${sidebarStrategy.isActive ? 'bg-amber-500/20 border-amber-400 text-amber-100 hover:border-amber-300' : 'bg-green-500/20 border-green-400 text-green-100 hover:border-green-300'}`}
                  >
                    {sidebarStrategy.isActive
                      ? (sidebarActionLoading === 'archive' ? 'Archiving…' : 'Archive')
                      : (sidebarActionLoading === 'restore' ? 'Restoring…' : 'Restore')}
                  </button>
                  <button
                    type="button"
                    onClick={handleSidebarDelete}
                    disabled={sidebarActionLoading === 'delete'}
                    className="px-4 py-2 rounded-lg border border-red-500/40 text-red-300 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sidebarActionLoading === 'delete' ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

function SidebarSnapshotStat({ label, value, sub, tone = 'neutral' }) {
  const toneClass = tone === 'positive'
    ? 'text-green-300'
    : tone === 'negative'
      ? 'text-red-300'
      : 'text-primary-light'

  return (
    <div className="rounded-xl border border-primary/30 bg-primary-dark/60 p-3">
      <p className="text-[10px] uppercase tracking-[0.25em] text-primary-light/40 mb-1">{label}</p>
      <p className={`text-lg font-semibold ${toneClass}`}>{value}</p>
      {sub && <p className="text-xs text-primary-light/50 mt-0.5">{sub}</p>}
    </div>
  )
}
