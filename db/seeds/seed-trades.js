const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

const SEED_USER_EMAIL = process.env.SEED_USER_EMAIL || 'demo@seed.local'
const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD || 'password123'
const SEED_USER_USERNAME = process.env.SEED_USER_USERNAME || 'demo-user'

async function getOrCreateSeedUser() {
  const existing = await prisma.user.findUnique({ where: { email: SEED_USER_EMAIL } })
  if (existing) {
    if (!existing.username) {
      return prisma.user.update({
        where: { id: existing.id },
        data: { username: SEED_USER_USERNAME }
      })
    }
    return existing
  }

  const passwordHash = await bcrypt.hash(SEED_USER_PASSWORD, 10)
  return prisma.user.create({
    data: {
      username: SEED_USER_USERNAME,
      email: SEED_USER_EMAIL,
      passwordHash
    }
  })
}

const tradeTemplates = [
  {
    strategyName: 'Elliott Wave Reversal',
    instruments: ['BTCUSDT', 'ETHUSDT'],
    defaultDirection: 'long',
    entryPrice: 62000,
    entryDrift: 220,
    exitDelta: 1400,
    exitDrift: 110,
    positionSize: 0.35,
    sizeDrift: 0.01,
    basePnl: 950,
    pnlDrift: 130,
    baseR: 1.3,
    rDrift: 0.12,
    offsetDays: 0,
    daySpacing: 3,
    holdHours: 60,
    holdDrift: 6,
    openEvery: 9,
    lossEvery: 5
  },
  {
    strategyName: 'Support/Resistance Breakout',
    instruments: ['ETHUSDT', 'NQ100'],
    defaultDirection: 'long',
    alternateDirection: true,
    entryPrice: 3300,
    entryDrift: 45,
    exitDelta: 120,
    exitDrift: 15,
    positionSize: 8,
    sizeDrift: 0.2,
    basePnl: 480,
    pnlDrift: 65,
    baseR: 1.05,
    rDrift: 0.08,
    offsetDays: 1,
    daySpacing: 2,
    holdHours: 28,
    holdDrift: 3,
    openEvery: 8,
    lossEvery: 4
  },
  {
    strategyName: 'RSI Divergence Scalp',
    instruments: ['EURUSD', 'GBPUSD', 'USDJPY'],
    defaultDirection: 'short',
    entryPrice: 1.0850,
    entryDrift: 0.0008,
    exitDelta: 0.0025,
    exitDrift: 0.0003,
    positionSize: 150000,
    sizeDrift: 5000,
    basePnl: 260,
    pnlDrift: 35,
    baseR: 0.9,
    rDrift: 0.07,
    offsetDays: 0,
    daySpacing: 1,
    holdHours: 6,
    holdDrift: 1,
    openEvery: 10,
    lossEvery: 3
  },
  {
    strategyName: 'Trend Continuation Pullback',
    instruments: ['GBPUSD', 'AUDUSD'],
    defaultDirection: 'long',
    entryPrice: 1.2640,
    entryDrift: 0.0015,
    exitDelta: 0.004,
    exitDrift: 0.0006,
    positionSize: 100000,
    sizeDrift: 2500,
    basePnl: 420,
    pnlDrift: 55,
    baseR: 1.25,
    rDrift: 0.1,
    offsetDays: 2,
    daySpacing: 2,
    holdHours: 18,
    holdDrift: 2,
    openEvery: 7,
    lossEvery: 6
  },
  {
    strategyName: 'Volatility Compression Breakout',
    instruments: ['NVDA', 'TSLA', 'AAPL'],
    defaultDirection: 'long',
    entryPrice: 118,
    entryDrift: 4.5,
    exitDelta: 8,
    exitDrift: 1.2,
    positionSize: 150,
    sizeDrift: 5,
    basePnl: 320,
    pnlDrift: 40,
    baseR: 0.95,
    rDrift: 0.06,
    offsetDays: 3,
    daySpacing: 3,
    holdHours: 34,
    holdDrift: 4,
    openEvery: 6,
    lossEvery: 5
  }
]

function buildTrades() {
  const trades = []
  const baseDate = Date.UTC(2024, 8, 1, 13, 0, 0)

  tradeTemplates.forEach((template, templateIndex) => {
    for (let i = 0; i < 10; i++) {
      const instrumentList = template.instruments || []
      const instrument = instrumentList.length ? instrumentList[i % instrumentList.length] : template.instrument
      const direction = template.alternateDirection && i % 2 === 1 ? 'short' : template.defaultDirection
      const entryTimestamp = baseDate + (template.offsetDays + i * template.daySpacing + templateIndex) * 24 * 60 * 60 * 1000
      const entryDatetime = new Date(entryTimestamp)
      const shouldStayOpen = template.openEvery && (i + templateIndex) % template.openEvery === 0
      const holdHours = template.holdHours + i * template.holdDrift
      const exitDatetime = shouldStayOpen ? null : new Date(entryTimestamp + holdHours * 60 * 60 * 1000)
      const entryPrice = Number((template.entryPrice + i * template.entryDrift).toFixed(4))
      const movement = template.exitDelta + i * template.exitDrift
      const calculatedExit = exitDatetime
        ? Number((direction === 'long' ? entryPrice + movement : entryPrice - movement).toFixed(4))
        : null
      const positionSize = Number((template.positionSize + i * template.sizeDrift).toFixed(2))

      let realizedPnl = null
      let rMultiple = null
      if (exitDatetime) {
        const basePnl = template.basePnl + i * template.pnlDrift
        const isLoss = template.lossEvery && (i + templateIndex) % template.lossEvery === 0
        realizedPnl = Number((isLoss ? -Math.abs(basePnl) : basePnl).toFixed(2))
        const baseR = template.baseR + i * template.rDrift
        rMultiple = Number((isLoss ? -Math.abs(baseR) : baseR).toFixed(2))
      }

      trades.push({
        strategyName: template.strategyName,
        instrument,
        direction,
        entryDatetime: entryDatetime.toISOString(),
        exitDatetime: exitDatetime ? exitDatetime.toISOString() : null,
        entryPrice,
        exitPrice: calculatedExit,
        positionSize,
        realizedPnl,
        rMultiple
      })
    }
  })

  return trades
}

const seedTrades = buildTrades()

async function main() {
  console.log('🌱 Seeding trades...')

  const user = await getOrCreateSeedUser()

  const strategies = await prisma.strategy.findMany({
    where: { userId: user.id },
    select: { id: true, name: true }
  })
  const strategyMap = new Map(strategies.map((strategy) => [strategy.name, strategy.id]))

  if (!strategyMap.size) {
    console.warn('⚠️  No strategies found for user. Trades will be seeded without strategy references.')
  }

  await prisma.trade.deleteMany({ where: { userId: user.id } })

  await prisma.trade.createMany({
    data: seedTrades.map((trade) => ({
      userId: user.id,
      strategyId: trade.strategyName ? strategyMap.get(trade.strategyName) ?? null : null,
      instrument: trade.instrument,
      direction: trade.direction,
      entryDatetime: new Date(trade.entryDatetime),
      exitDatetime: trade.exitDatetime ? new Date(trade.exitDatetime) : null,
      entryPrice: trade.entryPrice,
      exitPrice: trade.exitPrice,
      positionSize: trade.positionSize,
      realizedPnl: trade.realizedPnl,
      rMultiple: trade.rMultiple
    }))
  })

  console.log('✅ Trades seeded successfully for', user.email)
}

main()
  .catch((err) => {
    console.error('❌ Error seeding trades:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
