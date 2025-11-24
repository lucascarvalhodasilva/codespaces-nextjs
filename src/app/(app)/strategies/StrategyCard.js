'use client'

export default function StrategyCard({ strategy, onShowDetails }) {
  const isActive = Boolean(strategy.isActive)
  const statusLabel = isActive ? 'Active' : 'Archived'
  const cardToneClasses = isActive
    ? 'bg-primary-dark border-primary/30 shadow-lg'
    : 'bg-primary-dark/40 border-primary/10 filter saturate-50'

  const handleClick = () => {
    onShowDetails?.(strategy.id)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onShowDetails?.(strategy.id)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`rounded-xl border p-5 transition-all duration-300 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${cardToneClasses} ${strategy.__isNew ? 'animate-strategy-enter' : ''} hover:outline hover:outline-1 hover:outline-primary/60`}
      aria-label={`View details for strategy ${strategy.name}`}
    >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-lg font-semibold ${isActive ? 'text-primary-light' : 'text-primary-light/70'}`}>{strategy.name}</h3>
              {strategy.shortCode && (
                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded font-mono">
                  {strategy.shortCode}
                </span>
              )}
            </div>
            <p className={`text-xs ${isActive ? 'text-primary-light/60' : 'text-primary-light/40'}`}>
              {statusLabel} • Created {new Date(strategy.createdAt).toLocaleDateString('de-DE')}
            </p>
            {!isActive && strategy.archivedReason && (
              <p className="text-[10px] text-amber-200 mt-1">
                Archived: {strategy.archivedReason}
              </p>
            )}
          </div>
        </div>

        {/* Setup Description */}
        {strategy.setupDescription && (
          <div className="mb-3">
            <p className={`${isActive ? 'text-primary-light/70' : 'text-primary-light/40'} text-xs leading-relaxed line-clamp-3`}>
              {strategy.setupDescription}
            </p>
          </div>
        )}

        {/* Technical Indicators */}
        {strategy.technicals && strategy.technicals.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold text-primary-light/80 mb-2">Technical Conditions:</h4>
            <div className="space-y-1.5">
              {strategy.technicals.slice(0, 3).map((tech) => (
                <div 
                  key={tech.id} 
                  className="bg-primary-darkest/50 rounded-lg p-2 border border-primary/20"
                >
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-medium text-xs ${isActive ? 'text-primary' : 'text-primary-light/60'}`}>{tech.indicator}</span>
                      {tech.timeframe && (
                        <span className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${isActive ? 'bg-primary/10 text-primary-light/70' : 'bg-primary/5 text-primary-light/40'}`}>
                          {tech.timeframe}
                        </span>
                      )}
                    </div>
                    {tech.isRequired ? (
                      <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${isActive ? 'bg-red-500/20 text-red-400' : 'bg-red-500/10 text-red-400/60'}`}>
                        Req
                      </span>
                    ) : (
                      <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-500/10 text-blue-400/60'}`}>
                        Opt
                      </span>
                    )}
                  </div>
                  <p className={`${isActive ? 'text-primary-light/60' : 'text-primary-light/40'} text-[10px] leading-relaxed line-clamp-2`}>
                    {tech.condition}
                  </p>
                </div>
              ))}
              {strategy.technicals.length > 3 && (
                <p className="text-[10px] text-primary-light/40 text-center pt-1">
                  + {strategy.technicals.length - 3} more conditions
                </p>
              )}
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
      <div className="text-xs text-primary-light/40 italic">
        Click to view full strategy details
      </div>
    </div>
  )
}
