'use client'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
})

export default function StrategyLeaderboard({ strategies, stats }) {
  // Filter active strategies and attach stats
  const activeStrategies = strategies
    .filter(s => s.isActive)
    .map(s => ({
      ...s,
      stats: stats[s.id] || { totalPnl: 0, winRate: 0, total: 0 }
    }))

  if (activeStrategies.length === 0) return null

  // Sort strategies for best and worst
  const bestStrategies = [...activeStrategies]
    .sort((a, b) => b.stats.totalPnl - a.stats.totalPnl)
    .slice(0, 3)

  const worstStrategies = [...activeStrategies]
    .sort((a, b) => a.stats.totalPnl - b.stats.totalPnl)
    .slice(0, 3)

  const renderCard = (strategy, index, type) => (
    <div 
      key={`${type}-${strategy.id}`}
      className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary-darkest/40 p-4 transition-all hover:border-primary/40 hover:bg-primary-darkest/60"
    >
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-10 ${
         type === 'best'
           ? (index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-300' : 'bg-orange-400')
           : 'bg-red-500'
      }`} />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
              type === 'best'
                ? (index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                   index === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                   'bg-orange-700/20 text-orange-400 border border-orange-700/30')
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {index + 1}
            </span>
            <h3 className="font-semibold text-primary-light truncate text-sm">
              {strategy.name}
            </h3>
          </div>
          <p className="text-xs text-primary-light/50 pl-7">
            {strategy.stats.total} trades
          </p>
        </div>
        
        <div className="text-right flex-shrink-0">
          <p className={`text-base font-bold ${strategy.stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {currencyFormatter.format(strategy.stats.totalPnl)}
          </p>
          <p className="text-xs text-primary-light/50">
            {Math.round(strategy.stats.winRate)}% WR
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-8 mb-10">
      <div>
        <h2 className="text-sm uppercase tracking-widest text-primary-light/60 flex items-center gap-2 mb-4">
          <span className="text-lg">🏆</span> Top Performers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4">
          {bestStrategies.map((s, i) => renderCard(s, i, 'best'))}
        </div>
      </div>

      <div>
        <h2 className="text-sm uppercase tracking-widest text-primary-light/60 flex items-center gap-2 mb-4">
          <span className="text-lg">📉</span> Needs Improvement
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4">
          {worstStrategies.map((s, i) => renderCard(s, i, 'worst'))}
        </div>
      </div>
    </div>
  )
}
