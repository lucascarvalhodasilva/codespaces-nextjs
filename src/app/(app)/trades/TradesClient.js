'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { formatInTimeZone } from 'date-fns-tz'
import {
  startOfToday,
  endOfToday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
  subWeeks,
  subMonths,
  subYears,
  subDays,
  format
} from 'date-fns'
import LogTradeModal from './LogTradeModal'
import { summarizeTrades, groupTradesByMonth } from '../../../domains/trades/utils/tradeMetrics.js'
import { useToast } from '../../../shared/ui/ToastProvider'
import { useConfirmation } from '../../../shared/ui/ConfirmationProvider'
import { downloadCsv, buildTradeCsvRows } from '../../../shared/utils/csv.js'
import Select from '../../../shared/ui/Select'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
})

const numberFormatter = new Intl.NumberFormat('en-US')

const TRADE_TIME_ZONE = process.env.NEXT_PUBLIC_TRADE_TIME_ZONE || 'UTC'
const DATE_FORMAT_TEMPLATE = 'MMM d, h:mm a zzz'

const formatTradeDate = (value) =>
  formatInTimeZone(new Date(value), TRADE_TIME_ZONE, DATE_FORMAT_TEMPLATE)

const normalizeClientTrade = (trade) => ({
  ...trade,
  strategyName: trade.strategy?.name ?? trade.strategyName ?? null,
  platform: trade.platform ?? null
})

const normalizeSymbol = (value = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '')

const FILTER_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This week' },
  { value: 'this-month', label: 'This month' },
  { value: 'this-year', label: 'This year' },
  { value: 'last-week', label: 'Last week' },
  { value: 'last-month', label: 'Last month' },
  { value: 'last-year', label: 'Last year' },
  { value: 'last-7', label: 'Last 7 days' },
  { value: 'last-30', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom range' }
]

const WEEK_OPTIONS = { weekStartsOn: 1 }

function getPresetRange(preset) {
  const now = new Date()
  switch (preset) {
    case 'today':
      return { start: startOfToday(), end: endOfToday() }
    case 'this-week':
      return { start: startOfWeek(now, WEEK_OPTIONS), end: endOfWeek(now, WEEK_OPTIONS) }
    case 'this-month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'this-year':
      return { start: startOfYear(now), end: endOfYear(now) }
    case 'last-week': {
      const lastWeek = subWeeks(now, 1)
      return { start: startOfWeek(lastWeek, WEEK_OPTIONS), end: endOfWeek(lastWeek, WEEK_OPTIONS) }
    }
    case 'last-month': {
      const lastMonth = subMonths(now, 1)
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
    }
    case 'last-year': {
      const lastYear = subYears(now, 1)
      return { start: startOfYear(lastYear), end: endOfYear(lastYear) }
    }
    case 'last-7':
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) }
    case 'last-30':
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) }
    default:
      return null
  }
}

export default function TradesClient({ initialTrades = [], initialSummary, initialMonthlyPnL, strategies = [], initialPlatforms = [] }) {
  const [trades, setTrades] = useState(initialTrades)
  const [summary, setSummary] = useState(initialSummary ?? summarizeTrades(initialTrades))
  const [monthlyPnL, setMonthlyPnL] = useState(initialMonthlyPnL ?? groupTradesByMonth(initialTrades))
  const [platformOptions, setPlatformOptions] = useState(initialPlatforms)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [activeTrade, setActiveTrade] = useState(null)
  const [filterPreset, setFilterPreset] = useState('all')
  const [customRange, setCustomRange] = useState({ from: '', to: '' })
  const [customRangeDraft, setCustomRangeDraft] = useState({ from: '', to: '' })
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCustomRangeModal, setShowCustomRangeModal] = useState(false)
  const [previousPreset, setPreviousPreset] = useState('all')
  const [isPortalReady, setIsPortalReady] = useState(false)
  const [sidebarTradeId, setSidebarTradeId] = useState(null)
  const router = useRouter()
  const { push: pushToast } = useToast()
  const confirm = useConfirmation()

  const currentRange = useMemo(() => {
    if (filterPreset === 'custom') {
      if (!customRange.from || !customRange.to) return null
      const start = startOfDay(new Date(customRange.from))
      const end = endOfDay(new Date(customRange.to))
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null
      return start <= end ? { start, end } : { start: end, end: start }
    }
    return getPresetRange(filterPreset)
  }, [filterPreset, customRange.from, customRange.to])

  const sidebarTrade = useMemo(
    () => trades.find((trade) => trade.id === sidebarTradeId) ?? null,
    [trades, sidebarTradeId]
  )

  const dateFilteredTrades = useMemo(() => {
    if (!currentRange) return trades
    return trades.filter((trade) => {
      const entryDate = new Date(trade.entryDatetime)
      if (Number.isNaN(entryDate.getTime())) return false
      return entryDate >= currentRange.start && entryDate <= currentRange.end
    })
  }, [trades, currentRange])

  const filteredTrades = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    const normalizedTerm = term ? normalizeSymbol(term) : ''

    const matchesSearch = (trade) => {
      if (!term) return true
      const instrument = trade.instrument ?? ''
      const strategy = trade.strategyName ?? ''

      const instrumentMatch = instrument.toLowerCase().includes(term)
      const strategyMatch = strategy.toLowerCase().includes(term)

      if (instrumentMatch || strategyMatch) return true

      if (!normalizedTerm) return false
      const normalizedInstrument = normalizeSymbol(instrument)
      const normalizedStrategy = normalizeSymbol(strategy)

      return (
        (normalizedInstrument && normalizedInstrument.includes(normalizedTerm)) ||
        (normalizedStrategy && normalizedStrategy.includes(normalizedTerm))
      )
    }

    return dateFilteredTrades
      .filter(matchesSearch)
      .filter((trade) => {
        if (statusFilter === 'all') return true
        const isClosed = Boolean(trade.exitDatetime)
        return statusFilter === 'closed' ? isClosed : !isClosed
      })
  }, [dateFilteredTrades, statusFilter, searchQuery])

  useEffect(() => {
    setSummary(summarizeTrades(dateFilteredTrades))
    setMonthlyPnL(groupTradesByMonth(dateFilteredTrades))
  }, [dateFilteredTrades])

  useEffect(() => {
    setIsPortalReady(true)
  }, [])

  const dateRangeLabel = useMemo(() => {
    if (currentRange) {
      const startLabel = format(currentRange.start, 'MMM d, yyyy')
      const endLabel = format(currentRange.end, 'MMM d, yyyy')
      return `${startLabel} – ${endLabel}`
    }
    return FILTER_OPTIONS.find((option) => option.value === filterPreset)?.label ?? 'All time'
  }, [currentRange, filterPreset])

  const closeModal = () => {
    setShowModal(false)
    setActiveTrade(null)
    setModalMode('create')
  }

  const handleTradeLogged = (trade) => {
    const normalized = normalizeClientTrade(trade)

    setTrades((prev) => [normalized, ...prev])
    if (normalized.platform) {
      setPlatformOptions((prev) => (prev.includes(normalized.platform) ? prev : [...prev, normalized.platform].sort((a, b) => a.localeCompare(b))))
    }

    pushToast(`Logged trade ${normalized.instrument}`, { type: 'success' })
    closeModal()
    router.refresh()
  }

  const handleTradeUpdated = (trade) => {
    const normalized = normalizeClientTrade(trade)

    setTrades((prev) => prev.map((existing) => (existing.id === normalized.id ? normalized : existing)))
    if (normalized.platform) {
      setPlatformOptions((prev) => (prev.includes(normalized.platform) ? prev : [...prev, normalized.platform].sort((a, b) => a.localeCompare(b))))
    }

    pushToast(`Updated trade ${normalized.instrument}`, { type: 'success' })
    closeModal()
    router.refresh()
  }

  const handleDeleteTrade = async (trade) => {
    const confirmed = await confirm({
      title: 'Delete trade?',
      message: `This will permanently remove ${trade.instrument} from your journal.`,
      details: trade.exitDatetime
        ? `Entered ${formatTradeDate(trade.entryDatetime)} · Exited ${formatTradeDate(trade.exitDatetime)}`
        : `Entered ${formatTradeDate(trade.entryDatetime)} · Position still open`,
      confirmLabel: 'Delete trade',
      cancelLabel: 'Keep trade',
      tone: 'danger'
    })

    if (!confirmed) return

    try {
      const res = await fetch(`/api/trades/${trade.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Failed to delete trade')
      }

      setTrades((prev) => prev.filter((existing) => existing.id !== trade.id))
      setSidebarTradeId((prev) => (prev === trade.id ? null : prev))

      pushToast(`Deleted trade ${trade.instrument}`, { type: 'success' })
      router.refresh()
    } catch (error) {
      console.error(error)
      pushToast(error.message || 'Failed to delete trade', { type: 'error' })
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setActiveTrade(null)
    setShowModal(true)
  }

  const openEditModal = (trade) => {
    setModalMode('edit')
    setActiveTrade(trade)
    setShowModal(true)
  }

  const openTradeSidebar = (tradeId) => {
    setSidebarTradeId(tradeId)
  }

  const closeTradeSidebar = () => {
    setSidebarTradeId(null)
  }

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value)
  }

  const handleCustomRangeDraftChange = (field, value) => {
    setCustomRangeDraft((prev) => ({ ...prev, [field]: value }))
  }

  const openCustomRangeModal = () => {
    setCustomRangeDraft(customRange.from && customRange.to ? customRange : { from: '', to: '' })
    setShowCustomRangeModal(true)
  }

  const handlePresetSelect = (value) => {
    if (value === 'custom') {
      if (filterPreset !== 'custom') {
        setPreviousPreset(filterPreset)
      }
      setFilterPreset('custom')
      openCustomRangeModal()
      return
    }
    setPreviousPreset(value)
    setFilterPreset(value)
    setShowCustomRangeModal(false)
  }

  const handleCancelCustomRange = () => {
    if (!customRange.from || !customRange.to) {
      setFilterPreset(previousPreset)
    }
    setShowCustomRangeModal(false)
  }

  const handleApplyCustomRange = () => {
    const { from, to } = customRangeDraft
    if (!from || !to) {
      pushToast('Select both start and end dates', { type: 'warning' })
      return
    }

    const start = new Date(from)
    const end = new Date(to)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      pushToast('Invalid date selection', { type: 'error' })
      return
    }

    if (start <= end) {
      setCustomRange({ from, to })
    } else {
      setCustomRange({ from: to, to: from })
    }

    setFilterPreset('custom')
    setShowCustomRangeModal(false)
  }

  const handleExportCsv = () => {
    if (!filteredTrades.length) {
      pushToast('No trades to export yet', { type: 'warning' })
      return
    }

    const rows = buildTradeCsvRows(filteredTrades, {
      dateFormatter: (value) => formatTradeDate(value),
      numberFormatter: (value) => (value != null ? Number(value) : '')
    })

    const timestamp = new Date().toISOString().split('T')[0]
    downloadCsv(`trades-${timestamp}.csv`, rows)
    pushToast('Exported trades CSV', { type: 'success' })
  }

  const haveTrades = filteredTrades.length > 0
  const emptyStateMessage = filterPreset === 'all' ? 'No trades logged yet.' : 'No trades match this date range.'

  return (
    <div className="space-y-8">
      <header className="sticky top-0 z-30 flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-primary-darkest/95  p-6 shadow-lg">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary-light/50 mb-2">Journal</p>
          <h1 className="text-4xl font-bold text-primary-light">Trades</h1>
          <p className="text-primary-light/60">Track entries, exits, and performance across all setups.</p>
        </div>
        <div className="flex gap-2 self-stretch md:self-auto md:items-center">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-lg border border-primary/40 text-primary-light/90 hover:border-primary/80 transition-colors font-light"
          >
            Export CSV
          </button>
          <button
            onClick={openCreateModal}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-darkest font-semibold rounded-lg transition-colors"
          >
            + Log Trade
          </button>
        </div>
      </header>
      {trades.length > 0 ? (
        <>
          <section className="mb-8 rounded-2xl bg-primary-darkest/40 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <label className="flex-1 flex flex-col gap-2 text-sm text-primary-light/60">
              <span className="text-xs uppercase tracking-[0.3em] text-primary-light/40">Search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by instrument or strategy"
                className="w-full px-3 py-2 rounded-lg bg-primary-darkest border border-primary/30 text-primary-light text-sm placeholder:text-primary-light/50 placeholder:text-sm focus:outline-none focus:border-primary"
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
                  { label: 'Open', value: 'open' },
                  { label: 'Closed', value: 'closed' }
                ]}
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <Select
                  className="sm:min-w-[220px]"
                  label={<span className="text-xs uppercase tracking-[0.3em] text-primary-light/40">Date preset</span>}
                  value={filterPreset}
                  onChange={(nextValue) => handlePresetSelect(nextValue)}
                  options={FILTER_OPTIONS}
                />
                {filterPreset === 'custom' && (
                  <button
                    type="button"
                    onClick={openCustomRangeModal}
                    className="px-3 py-2 rounded-lg border border-primary/30 text-primary-light text-xs uppercase tracking-[0.2em] hover:border-primary"
                  >
                    Edit range
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Trades" value={summary.total} sub={`${summary.open} open`} />
            <StatCard label="Win Rate" value={`${summary.winRate.toFixed(0)}%`} sub={`${summary.closed} closed`} />
            <StatCard label="Net Realized PnL" value={currencyFormatter.format(summary.totalPnl)} tone={summary.totalPnl >= 0 ? 'positive' : 'negative'} />
            <StatCard label="Avg R-Multiple" value={summary.avgR.toFixed(2)} />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 bg-primary-dark rounded-2xl border border-primary/30 px-6 pb-6 md:sticky md:top-[140px] md:z-20 md:max-h-[calc(100vh-9rem)] md:overflow-hidden">
              <div className="flex items-center justify-between my-6">
                <div>
                  <h2 className="text-xl font-semibold text-primary-light">Recent Trades</h2>
                  <p className="text-xs text-primary-light/60">{dateRangeLabel}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleStatusFilterChange('all')}
                    className={`px-3 py-1 rounded-full border transition-colors ${
                      statusFilter === 'all'
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-transparent bg-primary/5 text-primary-light/50 hover:text-primary'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusFilterChange('open')}
                    className={`px-3 py-1 rounded-full border transition-colors ${
                      statusFilter === 'open'
                        ? 'border-amber-300 text-amber-300 bg-amber-500/10'
                        : 'border-transparent bg-amber-500/5 text-primary-light/50 hover:text-amber-200'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusFilterChange('closed')}
                    className={`px-3 py-1 rounded-full border transition-colors ${
                      statusFilter === 'closed'
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-transparent bg-primary/5 text-primary-light/50 hover:text-primary'
                    }`}
                  >
                    Closed
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto thin-scrollbar">
                <div className="max-h-[60vh] overflow-y-auto thin-scrollbar pr-2">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-primary-light/50 text-xs uppercase tracking-wide truncate">
                      <th className="py-3 pr-4 font-medium">Instrument</th>
                      <th className="py-3 pr-4 font-medium">Entry</th>
                      <th className="py-3 pr-4 font-medium">Exit</th>
                      <th className="py-3 pr-4 font-medium">Size</th>
                      <th className="py-3 pr-4 font-medium">PnL</th>
                      <th className="py-3 pr-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/20">
                    {!haveTrades && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-primary-light/50">
                          {emptyStateMessage}
                        </td>
                      </tr>
                    )}
                    {filteredTrades.map((trade) => (
                      <tr
                        key={trade.id}
                        className="text-primary-light/80 transition-colors hover:bg-primary-darkest/40 cursor-pointer"
                        onClick={() => openTradeSidebar(trade.id)}
                      >
                        <td className="py-4 pr-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-primary-light">{trade.instrument}</span>
                            <span className={`text-xs uppercase tracking-wide ${trade.direction === 'long' ? 'text-green-300' : 'text-red-300'}`}>
                              {trade.direction}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <p>{formatTradeDate(trade.entryDatetime)}</p>
                          <p className="text-xs text-primary-light/50">@ {numberFormatter.format(Number(trade.entryPrice))}</p>
                        </td>
                        <td className="py-4 pr-4">
                          {trade.exitDatetime ? (
                            <>
                              <p>{formatTradeDate(trade.exitDatetime)}</p>
                              <p className="text-xs text-primary-light/50">@ {trade.exitPrice != null ? numberFormatter.format(Number(trade.exitPrice)) : '--'}</p>
                            </>
                          ) : (
                            <span className="text-amber-300 text-xs">Open</span>
                          )}
                        </td>
                        <td className="py-4 pr-4">
                          {numberFormatter.format(Number(trade.positionSize))} units
                        </td>
                        <td className="py-4 pr-4">
                          {typeof trade.realizedPnl === 'number' ? (
                            <span className={trade.realizedPnl >= 0 ? 'text-green-300' : 'text-red-300'}>
                              {currencyFormatter.format(trade.realizedPnl)}
                            </span>
                          ) : (
                            <span className="text-amber-300">Pending</span>
                          )}
                          {trade.rMultiple != null && (
                            <p className="text-xs text-primary-light/50">R: {trade.rMultiple}</p>
                          )}
                        </td>
                        <td className="py-4 pr-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                openEditModal(trade)
                              }}
                              className="p-2 rounded border border-primary/30 text-primary-light hover:border-primary/60 hover:text-primary"
                              aria-label={`Edit trade ${trade.instrument}`}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDeleteTrade(trade)
                              }}
                              className="p-2 rounded border border-red-400/40 text-red-300 hover:border-red-400"
                              aria-label={`Delete trade ${trade.instrument}`}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>

            <div className="bg-primary-dark rounded-2xl border border-primary/30 p-6 flex flex-col gap-6 self-start">
              <div>
                <h2 className="text-xl font-semibold text-primary-light mb-1">Monthly PnL</h2>
                <p className="text-xs text-primary-light/60">Aggregated realized PnL per entry month</p>
              </div>
              <div className="space-y-4">
                {monthlyPnL.map((month) => (
                  <div key={month.label}>
                    <div className="flex items-center justify-between text-sm text-primary-light/70">
                      <span>{month.label}</span>
                      <span className={month.pnl >= 0 ? 'text-green-300' : 'text-red-300'}>
                        {currencyFormatter.format(month.pnl)}
                      </span>
                    </div>
                    <div className="w-full h-2 mt-2 bg-primary-darkest/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${month.pnl >= 0 ? 'bg-green-400/70' : 'bg-red-400/70'}`}
                        style={{ width: `${Math.min(Math.abs(month.pnl) / 2000 * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-primary/20 pt-4 text-sm text-primary-light/70">
                <p>Schema reference:</p>
                <ul className="mt-2 space-y-1 text-xs text-primary-light/60">
                  <li>instrument • direction • entry/exit timestamps</li>
                  <li>entry_price • exit_price • position_size</li>
                  <li>realized_pnl • r_multiple • strategy_id (nullable)</li>
                </ul>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="bg-primary-dark rounded-2xl border border-primary/30 p-10 text-center space-y-4">
          <span className="text-6xl block">📓</span>
          <h2 className="text-2xl font-bold text-primary-light">Log your first trade</h2>
          <p className="text-primary-light/60 max-w-xl mx-auto">
            Capture entries, exits, and notes to build conviction in your strategy. Start logging to unlock analytics and performance insights.
          </p>
          <button
            onClick={openCreateModal}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-darkest font-semibold rounded-lg transition-colors"
          >
            + Log a trade
          </button>
        </div>
      )}

      {isPortalReady && showCustomRangeModal &&
        createPortal(
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={handleCancelCustomRange} />
            <div className="relative z-10 w-full max-w-md bg-primary-darkest border border-primary/30 rounded-2xl p-6 space-y-4 shadow-2xl">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary-light/50 mb-1">Custom range</p>
                <h2 className="text-2xl text-primary-light font-semibold">Select date window</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col gap-2 text-xs text-primary-light/70">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-primary-light/40">Start date</span>
                  <input
                    type="date"
                    value={customRangeDraft.from}
                    onChange={(e) => handleCustomRangeDraftChange('from', e.target.value)}
                    className="px-3 py-2 bg-primary-darkest border border-primary/40 rounded-lg text-primary-light focus:outline-none focus:border-primary"
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs text-primary-light/70">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-primary-light/40">End date</span>
                  <input
                    type="date"
                    value={customRangeDraft.to}
                    onChange={(e) => handleCustomRangeDraftChange('to', e.target.value)}
                    className="px-3 py-2 bg-primary-darkest border border-primary/40 rounded-lg text-primary-light focus:outline-none focus:border-primary"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelCustomRange}
                  className="px-4 py-2 rounded-lg border border-primary/30 text-primary-light/80 hover:text-primary-light"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustomRange}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-darkest font-semibold hover:bg-primary/90"
                >
                  Apply range
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {isPortalReady && showModal &&
        createPortal(
          <LogTradeModal
            strategies={strategies}
            platforms={platformOptions}
            mode={modalMode}
            trade={activeTrade}
            onClose={closeModal}
            onCreated={handleTradeLogged}
            onUpdated={handleTradeUpdated}
          />,
          document.body
        )}

      {sidebarTrade && (
        <>
          <div
            className="!mt-0 fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={closeTradeSidebar}
          />
          <aside className="!mt-0 fixed inset-y-0 right-0 w-full max-w-md bg-primary-darkest border-l border-primary/30 z-50 shadow-2xl flex flex-col">
            <div className="flex items-start justify-between p-6 border-b border-primary/20">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary-light/50 mb-1">Trade</p>
                <h2 className="text-2xl font-semibold text-primary-light">{sidebarTrade.instrument}</h2>
                <p className="text-sm text-primary-light/60">
                  {sidebarTrade.direction?.toUpperCase()} • {formatTradeDate(sidebarTrade.entryDatetime)}
                </p>
              </div>
              <button
                type="button"
                onClick={closeTradeSidebar}
                className="p-2 rounded-full text-primary-light/60 hover:text-primary-light hover:bg-primary/10"
                aria-label="Close trade details"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-primary-light/80">
              <div className="grid grid-cols-2 gap-4">
                <DetailItem label="Entry" value={formatTradeDate(sidebarTrade.entryDatetime)} />
                <DetailItem label="Exit" value={sidebarTrade.exitDatetime ? formatTradeDate(sidebarTrade.exitDatetime) : 'Open'} />
                <DetailItem label="Position" value={`${numberFormatter.format(Number(sidebarTrade.positionSize))} units`} />
                <DetailItem label="Entry price" value={numberFormatter.format(Number(sidebarTrade.entryPrice))} />
                <DetailItem label="Exit price" value={sidebarTrade.exitPrice != null ? numberFormatter.format(Number(sidebarTrade.exitPrice)) : '—'} />
                <DetailItem label="Platform" value={sidebarTrade.platform ?? '—'} />
              </div>
              <div className="border-t border-primary/20 pt-4">
                <DetailItem label="Realized PnL" value={sidebarTrade.realizedPnl != null ? currencyFormatter.format(sidebarTrade.realizedPnl) : 'Pending'} />
                <DetailItem label="R-Multiple" value={sidebarTrade.rMultiple != null ? sidebarTrade.rMultiple : '—'} />
                <DetailItem label="Strategy" value={sidebarTrade.strategyName ?? 'Manual'} />
              </div>
            </div>

            <div className="mt-auto p-6 border-t border-primary/20 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  if (sidebarTrade) openEditModal(sidebarTrade)
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-primary/40 text-primary-light hover:border-primary/70"
              >
                Edit trade
              </button>
              <button
                type="button"
                onClick={() => {
                  if (sidebarTrade) handleDeleteTrade(sidebarTrade)
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-red-500/40 text-red-300 hover:border-red-400"
              >
                Delete
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.3em] text-primary-light/40 mb-1">{label}</p>
      <p className="text-primary-light">{value}</p>
    </div>
  )
}

function StatCard({ label, value, sub, tone }) {
  const toneClasses = tone === 'positive'
    ? 'text-green-300'
    : tone === 'negative'
      ? 'text-red-300'
      : 'text-primary-light'

  return (
    <div className="bg-primary-dark rounded-2xl border border-primary/30 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-primary-light/50 mb-2">{label}</p>
      <p className={`text-3xl font-semibold ${toneClasses}`}>{value}</p>
      {sub && <p className="text-xs text-primary-light/50 mt-1">{sub}</p>}
    </div>
  )
}

function PencilIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M15.232 5.232l3.536 3.536M7.5 13.5l6.732-6.732a2 2 0 112.828 2.828L10.328 16.5H7.5v-2.818z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 19.5h12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TrashIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.5 7.5h15M9.75 10.5v6M14.25 10.5v6M6 7.5l1 11a2 2 0 001.995 1.851h6.01A2 2 0 0016 18.5l1-11M9.75 7.5v-1a1.5 1.5 0 011.5-1.5h1.5a1.5 1.5 0 011.5 1.5v1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
