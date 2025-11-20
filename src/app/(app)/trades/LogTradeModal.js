'use client'
import { useState, useMemo, useEffect } from 'react'
import FormModal from '../../shared/ui/FormModal'

const defaultForm = {
  instrument: '',
  direction: 'long',
  entryDatetime: '',
  exitDatetime: '',
  entryPrice: '',
  exitPrice: '',
  positionSize: '',
  realizedPnl: '',
  rMultiple: '',
  strategyId: '',
  isOpen: true
}

const createEmptyForm = () => ({ ...defaultForm })

const formatDateForInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const tzOffsetMs = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16)
}

const createFormFromTrade = (trade) => ({
  instrument: trade.instrument ?? '',
  direction: trade.direction ?? 'long',
  entryDatetime: formatDateForInput(trade.entryDatetime),
  exitDatetime: formatDateForInput(trade.exitDatetime),
  entryPrice: trade.entryPrice ?? '',
  exitPrice: trade.exitPrice ?? '',
  positionSize: trade.positionSize ?? '',
  realizedPnl: trade.realizedPnl ?? '',
  rMultiple: trade.rMultiple ?? '',
  strategyId: trade.strategyId ? String(trade.strategyId) : '',
  isOpen: !trade.exitDatetime
})

export default function LogTradeModal({
  strategies = [],
  mode = 'create',
  trade = null,
  onClose,
  onCreated,
  onUpdated
}) {
  const isEditMode = mode === 'edit'
  const [form, setForm] = useState(isEditMode && trade ? createFormFromTrade(trade) : createEmptyForm())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (isEditMode && trade) {
      setForm(createFormFromTrade(trade))
    } else if (!isEditMode) {
      setForm(createEmptyForm())
    }
    setError(null)
    setTouched(false)
  }, [isEditMode, trade])

  const validationError = useMemo(() => {
    if (!form.instrument.trim()) return 'Instrument is required'
    if (!form.entryDatetime) return 'Entry date/time is required'
    if (!form.entryPrice) return 'Entry price is required'
    if (!form.positionSize) return 'Position size is required'
    return null
  }, [form.instrument, form.entryDatetime, form.entryPrice, form.positionSize])

  const isValid = !validationError

  const updateField = (field, value) => {
    if (field === 'isOpen') {
      setForm((prev) => ({
        ...prev,
        isOpen: value,
        exitDatetime: value ? '' : prev.exitDatetime,
        exitPrice: value ? '' : prev.exitPrice,
        realizedPnl: value ? '' : prev.realizedPnl,
        rMultiple: value ? '' : prev.rMultiple
      }))
      return
    }

    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)
    setError(null)
    if (!isValid) {
      setError(validationError)
      return
    }
    setLoading(true)
    try {
      const payload = {
        instrument: form.instrument.trim(),
        direction: form.direction,
        entryDatetime: form.entryDatetime,
        exitDatetime: form.isOpen ? null : form.exitDatetime || null,
        entryPrice: form.entryPrice,
        exitPrice: form.isOpen ? null : form.exitPrice || null,
        positionSize: form.positionSize,
        realizedPnl: form.isOpen ? null : form.realizedPnl || null,
        rMultiple: form.isOpen ? null : form.rMultiple || null,
        strategyId: form.strategyId || null
      }

      const endpoint = isEditMode && trade ? `/api/trades/${trade.id}` : '/api/trades'
      const res = await fetch(endpoint, {
        method: isEditMode ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to log trade')
        setLoading(false)
        return
      }
      setLoading(false)
      if (isEditMode) {
        onUpdated?.(data.data)
      } else {
        onCreated?.(data.data)
      }
    } catch (err) {
      console.error(err)
      setError('Network error while logging trade')
      setLoading(false)
    }
  }

  return (
    <FormModal
      eyebrow={isEditMode ? 'Update Entry' : 'New Entry'}
      title={isEditMode ? 'Edit Trade' : 'Log Trade'}
      subtitle={isEditMode ? 'Tweak sizing, exits, or notes for this trade.' : 'Capture entries, exits, and sizing details in seconds.'}
      onClose={onClose}
    >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-primary-light/80 mb-2">Instrument *</label>
              <input
                type="text"
                value={form.instrument}
                onChange={(e) => updateField('instrument', e.target.value.toUpperCase())}
                className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary"
                placeholder="BTCUSDT, AAPL"
              />
            </div>
            <div>
              <label className="block text-sm text-primary-light/80 mb-2">Strategy</label>
              <select
                value={form.strategyId}
                onChange={(e) => updateField('strategyId', e.target.value)}
                className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary"
              >
                <option value="">Manual / No strategy</option>
                {strategies.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="block text-sm text-primary-light/80 mb-2">Direction</p>
              <div className="flex gap-2">
                {['long', 'short'].map(dir => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => updateField('direction', dir)}
                    className={`flex-1 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                      form.direction === dir
                        ? dir === 'long'
                          ? 'bg-green-500/20 text-green-200 border-green-500/50'
                          : 'bg-red-500/20 text-red-200 border-red-500/50'
                        : 'border-primary/20 text-primary-light/60 hover:border-primary/50'
                    }`}
                  >
                    {dir === 'long' ? 'Long' : 'Short'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-primary-light/80 mb-2">Entry Price *</label>
              <input
                type="number"
                step="0.0001"
                value={form.entryPrice}
                onChange={(e) => updateField('entryPrice', e.target.value)}
                className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-primary-light/80 mb-2">Position Size *</label>
              <input
                type="number"
                step="0.0001"
                value={form.positionSize}
                onChange={(e) => updateField('positionSize', e.target.value)}
                className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-primary-light/80 mb-2">Entry Date & Time *</label>
              <input
                type="datetime-local"
                value={form.entryDatetime}
                onChange={(e) => updateField('entryDatetime', e.target.value)}
                className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-primary-light/80 mb-2">
                <input
                  type="checkbox"
                  checked={form.isOpen}
                  onChange={(e) => updateField('isOpen', e.target.checked)}
                  className="w-4 h-4"
                />
                Trade still open
              </label>
              <input
                type="datetime-local"
                value={form.exitDatetime}
                onChange={(e) => updateField('exitDatetime', e.target.value)}
                disabled={form.isOpen}
                className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary disabled:opacity-40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-primary-light/80 mb-2">Exit Price</label>
              <input
                type="number"
                step="0.0001"
                value={form.exitPrice}
                onChange={(e) => updateField('exitPrice', e.target.value)}
                disabled={form.isOpen}
                className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary disabled:opacity-40"
              />
            </div>
            <div>
              <label className="block text-sm text-primary-light/80 mb-2">Realized PnL</label>
              <input
                type="number"
                step="0.01"
                value={form.realizedPnl}
                onChange={(e) => updateField('realizedPnl', e.target.value)}
                disabled={form.isOpen}
                className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary disabled:opacity-40"
              />
            </div>
            <div>
              <label className="block text-sm text-primary-light/80 mb-2">R-Multiple</label>
              <input
                type="number"
                step="0.01"
                value={form.rMultiple}
                onChange={(e) => updateField('rMultiple', e.target.value)}
                disabled={form.isOpen}
                className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary disabled:opacity-40"
              />
            </div>
          </div>

          {(touched && validationError) && !error && (
            <div className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/30">
              <p className="text-amber-300 text-xs">{validationError}</p>
            </div>
          )}
          {error && (
            <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-primary/30">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary-light font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-darkest font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Log Trade'}
            </button>
          </div>
        </form>
    </FormModal>
  )
}
