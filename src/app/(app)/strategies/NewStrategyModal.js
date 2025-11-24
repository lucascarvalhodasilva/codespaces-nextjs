'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import FormModal from '../../shared/ui/FormModal'

export default function NewStrategyModal({ onClose, onCreated }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    shortCode: '',
    setupDescription: '',
    notes: ''
  })
  const [technicals, setTechnicals] = useState([])
  const [touched, setTouched] = useState(false)

  const validationError = useMemo(() => {
    if (!formData.name.trim()) return 'Name is required'
    for (let i = 0; i < technicals.length; i++) {
      const t = technicals[i]
      if (!t.indicator.trim()) return `Indicator required (Condition ${i + 1})`
      if (!t.condition.trim()) return `Condition text required (Condition ${i + 1})`
    }
    return null
  }, [formData.name, technicals])

  const isValid = !validationError

  const addTechnical = () => {
    setTechnicals(prev => ([...prev, {
      indicator: '',
      timeframe: '',
      condition: '',
      displayOrder: prev.length + 1,
      isRequired: 1
    }]))
  }

  const removeTechnical = (index) => {
    setTechnicals(technicals.filter((_, i) => i !== index))
  }

  const updateTechnical = (index, field, value) => {
    setTechnicals(prev => {
      const copy = [...prev]
      copy[index][field] = value
      return copy
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    setError(null)
    if (!isValid) {
      setError(validationError)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          shortCode: formData.shortCode.trim() || undefined,
            setupDescription: formData.setupDescription.trim() || undefined,
          notes: formData.notes.trim() || undefined,
          isActive: 1,
          technicals: technicals.map(t => ({
            indicator: t.indicator.trim(),
            timeframe: t.timeframe.trim() || undefined,
            condition: t.condition.trim(),
            displayOrder: t.displayOrder,
            isRequired: t.isRequired
          }))
        })
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.message || 'Creation failed')
        setLoading(false)
        return
      }
      const created = data.data
      // Optimistic callback then refresh to sync authoritative state
      if (onCreated && created) {
        onCreated(created)
        // schedule refresh slightly after optimistic update
        setTimeout(() => router.refresh(), 150)
      } else {
        router.refresh()
        onClose()
      }
    } catch (err) {
      setError('Network/Server error')
      setLoading(false)
    }
  }

  return (
    <FormModal
      title="New Strategy"
      subtitle="Document your setup, notes, and technical checklist before committing capital."
      onClose={onClose}
    >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-light/80 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-light/80 mb-2">Short Code</label>
              <input
                type="text"
                value={formData.shortCode}
                onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                placeholder="REV_1D"
                className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-light/80 mb-2">Setup Description</label>
            <textarea
              rows={3}
              value={formData.setupDescription}
              onChange={(e) => setFormData({ ...formData, setupDescription: e.target.value })}
              className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-light/80 mb-2">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary resize-none"
            />
          </div>

            <div className="border-t border-primary/30 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary-light">Technical Conditions</h3>
                <button
                  type="button"
                  onClick={addTechnical}
                  className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary-light rounded-lg text-sm font-medium transition-colors"
                >
                  + Add Condition
                </button>
              </div>

              <div className="space-y-4">
                {technicals.map((tech, index) => (
                  <div key={index} className="bg-primary-darkest/50 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-primary-light/60">Condition {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeTechnical(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >Remove</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-primary-light/60 mb-1">Indicator *</label>
                        <input
                          type="text"
                          value={tech.indicator}
                          onChange={(e) => updateTechnical(index, 'indicator', e.target.value)}
                          required
                          placeholder="RSI, Volume ..."
                          className="w-full px-3 py-2 bg-primary-darkest border border-primary/20 rounded text-sm text-primary-light focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-primary-light/60 mb-1">Timeframe</label>
                        <input
                          type="text"
                          value={tech.timeframe}
                          onChange={(e) => updateTechnical(index, 'timeframe', e.target.value)}
                          placeholder="1D, H4, M15"
                          className="w-full px-3 py-2 bg-primary-darkest border border-primary/20 rounded text-sm text-primary-light focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs text-primary-light/60 mb-1">Condition *</label>
                      <textarea
                        rows={2}
                        value={tech.condition}
                        onChange={(e) => updateTechnical(index, 'condition', e.target.value)}
                        required
                        placeholder="Describe the condition"
                        className="w-full px-3 py-2 bg-primary-darkest border border-primary/20 rounded text-sm text-primary-light focus:outline-none focus:border-primary resize-none"
                      />
                    </div>

                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`required-new-${index}`}
                          checked={tech.isRequired === 1}
                          onChange={(e) => updateTechnical(index, 'isRequired', e.target.checked ? 1 : 0)}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`required-new-${index}`} className="text-xs text-primary-light/60">Required</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-primary-light/60">Order:</label>
                        <input
                          type="number"
                          value={tech.displayOrder || index + 1}
                          onChange={(e) => updateTechnical(index, 'displayOrder', parseInt(e.target.value))}
                          className="w-16 px-2 py-1 bg-primary-darkest border border-primary/20 rounded text-sm text-primary-light focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {technicals.length === 0 && (
                  <div className="text-center py-8 text-primary-light/60">No technical conditions yet. Click &quot;Add Condition&quot;.</div>
                )}
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
            >Cancel</button>
            <button
              type="submit"
              disabled={loading || !isValid}
              className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-darkest font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
            >{loading ? 'Creating...' : 'Create Strategy'}</button>
          </div>
        </form>
    </FormModal>
  )
}
