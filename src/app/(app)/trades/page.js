import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../../lib/auth.js'
import prisma from '../../../../db/prisma.js'
import { summarizeTrades, groupTradesByMonth } from '../../../domains/trades/utils/tradeMetrics.js'
import TradesClient from './TradesClient'

export default async function TradesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/landing')
  }

  const tradesFromDb = await prisma.trade.findMany({
    where: { userId: user.id },
    include: {
      strategy: {
        select: { name: true }
      }
    },
    orderBy: { entryDatetime: 'desc' }
  })

  const trades = tradesFromDb.map((trade) => ({
    ...trade,
    strategyName: trade.strategy?.name ?? null
  }))

  const summary = summarizeTrades(trades)
  const monthlyPnL = groupTradesByMonth(trades)
  const platforms = Array.from(new Set(trades.map((trade) => trade.platform).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  )
  const strategies = await prisma.strategy.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <TradesClient
          initialTrades={trades}
          initialSummary={summary}
          initialMonthlyPnL={monthlyPnL}
          strategies={strategies}
          initialPlatforms={platforms}
        />
      </div>
    </div>
  )
}
