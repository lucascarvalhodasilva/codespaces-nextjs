export function downloadCsv(filename, rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    console.warn('No data to export')
    return
  }

  const csvContent = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function escapeCsvCell(value) {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return '"' + stringValue.replace(/"/g, '""') + '"'
  }
  return stringValue
}

export function buildTradeCsvRows(trades, options = {}) {
  const headers = [
    'Instrument',
    'Platform',
    'Direction',
    'Entry Date',
    'Exit Date',
    'Entry Price',
    'Exit Price',
    'Position Size',
    'Realized PnL',
    'R Multiple',
    'Strategy'
  ]

  const dateFormatter = options.dateFormatter || ((value) => value)
  const numberFormatter = options.numberFormatter || ((value) => value)

  const rows = trades.map((trade) => [
    trade.instrument,
    trade.platform || '',
    trade.direction,
    dateFormatter(trade.entryDatetime),
    trade.exitDatetime ? dateFormatter(trade.exitDatetime) : '',
    numberFormatter(trade.entryPrice),
    trade.exitPrice != null ? numberFormatter(trade.exitPrice) : '',
    numberFormatter(trade.positionSize),
    trade.realizedPnl != null ? numberFormatter(trade.realizedPnl) : '',
    trade.rMultiple != null ? numberFormatter(trade.rMultiple) : '',
    trade.strategyName || ''
  ])

  return [headers, ...rows]
}
