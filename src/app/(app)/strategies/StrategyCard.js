'use client'
import { useEffect, useState } from 'react'
import EditStrategyModal from './EditStrategyModal'

export default function StrategyCard({ strategy, onUpdated, onDeleted, onShowDetails }) {
  const [showEditModal, setShowEditModal] = useState(false)
  const isActive = Boolean(strategy.isActive)
  const cardToneClasses = isActive
    ? 'bg-primary-dark border-primary/30 shadow-lg'
    : 'bg-primary-dark/40 border-primary/10 filter saturate-50'
  const editButtonClasses = `flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary/20 hover:bg-primary/30 text-primary-light'
      : 'bg-primary-darkest/60 border border-primary/20 text-primary-light/60'
  }`
  const detailsButtonClasses = `flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
    isActive
      ? 'bg-primary hover:bg-primary/90 text-primary-darkest'
      : 'bg-primary/20 text-primary-darkest/70 border border-primary/20'
  }`

  useEffect(() => {
    if (!isActive && showEditModal) {
      setShowEditModal(false)
    }
  }, [isActive, showEditModal])

  return (
    <>
      <div className={`rounded-xl border p-6 transition-colors duration-300 ${cardToneClasses} ${strategy.__isNew ? 'animate-strategy-enter' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-xl font-semibold ${isActive ? 'text-primary-light' : 'text-primary-light/70'}`}>{strategy.name}</h3>
              {strategy.shortCode && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded font-mono">
                  {strategy.shortCode}
                </span>
              )}
            </div>
            <p className={`text-sm ${isActive ? 'text-primary-light/60' : 'text-primary-light/40'}`}>
              {strategy.isActive ? 'Active' : 'Inactive'} • Created {new Date(strategy.createdAt).toLocaleDateString('de-DE')}
            </p>
          </div>
        </div>

        {/* Setup Description */}
        {strategy.setupDescription && (
          <div className="mb-4">
            <p className={`${isActive ? 'text-primary-light/70' : 'text-primary-light/40'} text-sm leading-relaxed`}>
              {strategy.setupDescription}
            </p>
          </div>
        )}

        {/* Technical Indicators */}
        {strategy.technicals && strategy.technicals.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-primary-light/80 mb-2">Technical Conditions:</h4>
            <div className="space-y-2">
              {strategy.technicals.map((tech) => (
                <div 
                  key={tech.id} 
                  className="bg-primary-darkest/50 rounded-lg p-3 border border-primary/20"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${isActive ? 'text-primary' : 'text-primary-light/60'}`}>{tech.indicator}</span>
                      {tech.timeframe && (
                        <span className={`px-2 py-0.5 text-xs rounded font-mono ${isActive ? 'bg-primary/10 text-primary-light/70' : 'bg-primary/5 text-primary-light/40'}`}>
                          {tech.timeframe}
                        </span>
                      )}
                    </div>
                    {tech.isRequired ? (
                      <span className={`px-2 py-0.5 text-xs rounded font-medium ${isActive ? 'bg-red-500/20 text-red-400' : 'bg-red-500/10 text-red-400/60'}`}>
                        Required
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 text-xs rounded font-medium ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-400/60'}`}>
                        Optional
                      </span>
                    )}
                  </div>
                  <p className={`${isActive ? 'text-primary-light/60' : 'text-primary-light/40'} text-xs leading-relaxed`}>
                    {tech.condition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {strategy.notes && (
          <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className={`text-xs italic ${isActive ? 'text-primary-light/70' : 'text-primary-light/40'}`}>
              💡 {strategy.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button 
            type="button"
            disabled={!isActive}
            onClick={isActive ? () => setShowEditModal(true) : undefined}
            className={`${editButtonClasses} ${!isActive ? 'cursor-not-allowed opacity-60' : ''}`}
            title={isActive ? 'Edit strategy' : 'Reactivate this strategy to edit'}
            aria-disabled={!isActive}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onShowDetails?.(strategy.id)}
            className={detailsButtonClasses}
          >
            Strategy Details
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditStrategyModal
          strategy={strategy}
          onClose={() => setShowEditModal(false)}
          onUpdated={onUpdated}
          onDeleted={onDeleted}
        />
      )}
    </>
  )
}
