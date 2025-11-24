const allowedDirections = ['long', 'short']

export function validateTradePayload(payload) {
  if (!payload?.instrument?.trim()) return 'Instrument is required'
  const direction = payload?.direction?.toLowerCase()
  if (!allowedDirections.includes(direction)) return 'Direction must be long or short'
  if (!payload.entryDatetime) return 'Entry datetime is required'
  if (isNaN(new Date(payload.entryDatetime))) return 'Entry datetime is invalid'
  if (payload.exitDatetime && isNaN(new Date(payload.exitDatetime))) return 'Exit datetime is invalid'
  if (payload.entryPrice == null || isNaN(parseFloat(payload.entryPrice))) return 'Entry price is required'
  if (payload.positionSize == null || isNaN(parseFloat(payload.positionSize))) return 'Position size is required'
  if (payload.exitPrice != null && isNaN(parseFloat(payload.exitPrice))) return 'Exit price must be numeric'
  if (payload.realizedPnl != null && isNaN(parseFloat(payload.realizedPnl))) return 'Realized PnL must be numeric'
  if (payload.rMultiple != null && isNaN(parseFloat(payload.rMultiple))) return 'R multiple must be numeric'
  if (payload.platform != null && payload.platform.trim().length === 0) return 'Platform is invalid'
  if (payload.platform != null && payload.platform.trim().length > 60) return 'Platform must be shorter than 60 characters'
  return null
}

export function normalizeTradePayload(payload) {
  const direction = payload.direction.toLowerCase()
  return {
    strategyId:
      payload.strategyId !== undefined && payload.strategyId !== null && payload.strategyId !== ''
        ? Number(payload.strategyId)
        : null,
    instrument: payload.instrument.trim(),
    direction,
    entryDatetime: new Date(payload.entryDatetime),
    exitDatetime: payload.exitDatetime ? new Date(payload.exitDatetime) : null,
    entryPrice: parseFloat(payload.entryPrice),
    exitPrice: payload.exitPrice != null && payload.exitPrice !== '' ? parseFloat(payload.exitPrice) : null,
    positionSize: parseFloat(payload.positionSize),
    realizedPnl:
      payload.realizedPnl != null && payload.realizedPnl !== '' ? parseFloat(payload.realizedPnl) : null,
    rMultiple: payload.rMultiple != null && payload.rMultiple !== '' ? parseFloat(payload.rMultiple) : null,
    platform: payload.platform != null && payload.platform !== '' ? payload.platform.trim() : null
  }
}
