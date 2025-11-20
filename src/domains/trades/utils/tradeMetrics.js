export function summarizeTrades(trades) {
  if (!trades?.length) {
    return {
      total: 0,
      open: 0,
      closed: 0,
      winRate: 0,
      totalPnl: 0,
      avgR: 0
    }
  }

  const closed = trades.filter(t => t.exitDatetime && typeof t.realizedPnl === 'number')
  const wins = closed.filter(t => t.realizedPnl > 0)
  const totalPnl = closed.reduce((sum, t) => sum + (t.realizedPnl || 0), 0)
  const avgR = closed.length
    ? closed.reduce((sum, t) => sum + (t.rMultiple || 0), 0) / closed.length
    : 0

  return {
    total: trades.length,
    open: trades.filter(t => !t.exitDatetime).length,
    closed: closed.length,
    winRate: closed.length ? (wins.length / closed.length) * 100 : 0,
    totalPnl,
    avgR
  }
}

export function groupTradesByMonth(trades) {
  const formatter = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })
  const map = new Map()
  trades.forEach(trade => {
    const label = formatter.format(new Date(trade.entryDatetime))
    const pnl = trade.realizedPnl || 0
    map.set(label, (map.get(label) || 0) + pnl)
  })
  return Array.from(map.entries()).map(([label, pnl]) => ({ label, pnl }))
}
