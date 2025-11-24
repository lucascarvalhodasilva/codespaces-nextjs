import { redirect } from 'next/navigation'
import prisma from '../../../../db/prisma.js'
import { getCurrentUser } from '../../../../lib/auth.js'
import StrategiesClient from './StrategiesClient'
import { summarizeTrades } from '../../../domains/trades/utils/tradeMetrics.js'

export default async function StrategiesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/landing')
  }

  // Load strategies with technical conditions ordered
  const strategies = await prisma.strategy.findMany({
    where: { userId: user.id },
    include: {
      technicals: {
        orderBy: { displayOrder: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const trades = await prisma.trade.findMany({
    where: { userId: user.id, strategyId: { not: null } },
    select: {
      strategyId: true,
      instrument: true,
      entryDatetime: true,
      exitDatetime: true,
      realizedPnl: true,
      rMultiple: true
    }
  })

  const strategyStats = trades.reduce((acc, trade) => {
    if (!trade.strategyId) return acc
    if (!acc[trade.strategyId]) {
      acc[trade.strategyId] = []
    }
    acc[trade.strategyId].push(trade)
    return acc
  }, {})

  const statsPayload = Object.entries(strategyStats).reduce((acc, [strategyId, strategyTrades]) => {
    const summary = summarizeTrades(strategyTrades)
    const lastTradeAt = strategyTrades.reduce((latest, trade) => {
      const entry = trade.entryDatetime
      return !latest || entry > latest ? entry : latest
    }, null)

    const instrumentMap = strategyTrades.reduce((map, trade) => {
      const instrument = trade.instrument || 'Unspecified'
      if (!map[instrument]) {
        map[instrument] = {
          instrument,
          totalPnl: 0,
          trades: 0,
          wins: 0
        }
      }

      map[instrument].trades += 1
      if (typeof trade.realizedPnl === 'number') {
        map[instrument].totalPnl += trade.realizedPnl
        if (trade.realizedPnl > 0) {
          map[instrument].wins += 1
        }
      }

      return map
    }, {})

    const topInstruments = Object.values(instrumentMap)
      .map((instrumentStat) => ({
        ...instrumentStat,
        winRate: instrumentStat.trades ? (instrumentStat.wins / instrumentStat.trades) * 100 : 0,
        avgPnl: instrumentStat.trades ? instrumentStat.totalPnl / instrumentStat.trades : 0
      }))
      .sort((a, b) => b.totalPnl - a.totalPnl)
      .slice(0, 3)

    acc[strategyId] = {
      ...summary,
      lastTradeAt: lastTradeAt ? lastTradeAt.toISOString() : null,
      topInstruments
    }
    return acc
  }, {})

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <StrategiesClient strategies={strategies} strategyStats={statsPayload} />
      </div>
    </div>
  )
}
