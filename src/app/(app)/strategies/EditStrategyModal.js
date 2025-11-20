'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import FormModal from '../../shared/ui/FormModal'
import { useConfirmation } from '../../../shared/ui/ConfirmationProvider'

export default function EditStrategyModal({ strategy, onClose, onUpdated, onDeleted }) {
  const router = useRouter()
  const confirm = useConfirmation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: strategy.name,
    shortCode: strategy.shortCode || '',
    setupDescription: strategy.setupDescription || '',
    notes: strategy.notes || '',
    isActive: strategy.isActive
  })

  const [technicals, setTechnicals] = useState(
    strategy.technicals.map(t => ({
      id: t.id,
      indicator: t.indicator,
      timeframe: t.timeframe || '',
      condition: t.condition,
      displayOrder: t.displayOrder,
      isRequired: t.isRequired
    }))
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/strategies/${strategy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          technicals: technicals.map(({ id, ...rest }) => rest) // Remove id for new technicals
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'Update failed')
        setLoading(false)
        return
      }

      const updatedStrategy = data.data
      if (onUpdated && updatedStrategy) {
        onUpdated(updatedStrategy)
      }
      // Refresh to sync authoritative data
      setTimeout(() => router.refresh(), 120)
      onClose()
    } catch (err) {
      setError('An error occurred')
      setLoading(false)
    }
  }

  const addTechnical = () => {
    setTechnicals([...technicals, {
      indicator: '',
      timeframe: '',
      condition: '',
      displayOrder: technicals.length + 1,
      isRequired: 1
    }])
  }

  const removeTechnical = (index) => {
    setTechnicals(technicals.filter((_, i) => i !== index))
  }

  const updateTechnical = (index, field, value) => {
    const updated = [...technicals]
    updated[index][field] = value
    setTechnicals(updated)
  }

  const handleDelete = async () => {
    const approved = await confirm({
      title: 'Delete strategy',
      message: 'Deleting this strategy removes all of its technical conditions and cannot be undone.',
      details: strategy.name,
      confirmLabel: 'Delete forever',
      cancelLabel: 'Keep strategy',
      tone: 'danger'
    })
    if (!approved) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/strategies/${strategy.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok || !data.success) {
        setError(data.message || 'Delete failed')
        setLoading(false)
        return
      }
      if (onDeleted) {
        onDeleted(strategy.id, strategy.name)
      }
      setTimeout(() => router.refresh(), 80)
      onClose()
    } catch (err) {
      setError('Delete error')
      setLoading(false)
    }
  }

  return (
    <FormModal
      title="Edit Strategy"
      subtitle="Polish the notes, tweak the rules, or retire this playbook entirely."
      onClose={onClose}
    >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-light/80 mb-2">
                Strategy Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-light/80 mb-2">
                Short Code
              </label>
              <input
                type="text"
                value={formData.shortCode}
                onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                placeholder="e.g., REV_1D"
                className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-light/80 mb-2">
              Setup Description
            </label>
            <textarea
              value={formData.setupDescription}
              onChange={(e) => setFormData({ ...formData, setupDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-light/80 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive === 1}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked ? 1 : 0 })}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-primary-light/80">
              Active Strategy
            </label>
          </div>

          {/* Technical Conditions */}
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
                    <span className="text-sm font-medium text-primary-light/60">
                      Condition {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTechnical(index)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-primary-light/60 mb-1">
                        Indicator *
                      </label>
                      <input
                        type="text"
                        value={tech.indicator}
                        onChange={(e) => updateTechnical(index, 'indicator', e.target.value)}
                        required
                        placeholder="e.g., RSI, Elliott Wave"
                        className="w-full px-3 py-2 bg-primary-darkest border border-primary/20 rounded text-sm text-primary-light focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-primary-light/60 mb-1">
                        Timeframe
                      </label>
                      <input
                        type="text"
                        value={tech.timeframe}
                        onChange={(e) => updateTechnical(index, 'timeframe', e.target.value)}
                        placeholder="e.g., 1D, H4, M15"
                        className="w-full px-3 py-2 bg-primary-darkest border border-primary/20 rounded text-sm text-primary-light focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs text-primary-light/60 mb-1">
                      Condition *
                    </label>
                    <textarea
                      value={tech.condition}
                      onChange={(e) => updateTechnical(index, 'condition', e.target.value)}
                      required
                      rows={2}
                      placeholder="Describe the technical condition..."
                      className="w-full px-3 py-2 bg-primary-darkest border border-primary/20 rounded text-sm text-primary-light focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={tech.isRequired === 1}
                        onChange={(e) => updateTechnical(index, 'isRequired', e.target.checked ? 1 : 0)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={`required-${index}`} className="text-xs text-primary-light/60">
                        Required
                      </label>
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
                <div className="text-center py-8 text-primary-light/60">
                  No technical conditions yet. Click &quot;Add Condition&quot; to get started.
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-primary/30">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-primary/20 hover:bg-primary/30 text-primary-light font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-primary-darkest font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleDelete}
              className="px-5 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start"
            >
              Delete Strategy
            </button>
          </div>
        </form>
    </FormModal>
  )
}
