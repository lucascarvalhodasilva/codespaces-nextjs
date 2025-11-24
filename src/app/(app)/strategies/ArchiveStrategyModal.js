"use client"
import { useState } from 'react'
import FormModal from '../../shared/ui/FormModal'

export default function ArchiveStrategyModal({ strategy, onConfirm, onClose, isSubmitting = false }) {
  const [reason, setReason] = useState(strategy?.archivedReason || '')

  const handleSubmit = (event) => {
    event.preventDefault()
    onConfirm?.(reason)
  }

  return (
    <FormModal
      title="Archive Strategy"
      subtitle="Move this playbook out of rotation while keeping its history intact."
      onClose={isSubmitting ? undefined : onClose}
      footer={null}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-primary-light/70">
            Archiving keeps the strategy available for reporting but hides it from active workflows.
          </p>
          <label className="block text-sm font-medium text-primary-light/80">
            Optional reason
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g., poor performance, setup no longer valid"
            className="w-full px-4 py-2 bg-primary-darkest/50 border border-primary/30 rounded-lg text-primary-light focus:outline-none focus:border-primary resize-none"
          />
          <p className="text-xs text-primary-light/50">
            This note will appear anywhere the archived strategy is referenced.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg border border-primary/30 text-primary-light hover:border-primary/60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-100 font-semibold hover:border-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Archiving…' : 'Archive Strategy'}
          </button>
        </div>
      </form>
    </FormModal>
  )
}
