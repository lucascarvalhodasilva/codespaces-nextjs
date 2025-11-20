const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

const SEED_USER_EMAIL = process.env.SEED_USER_EMAIL || 'demo@seed.local'
const SEED_USER_PASSWORD = process.env.SEED_USER_PASSWORD || 'password123'

async function getOrCreateSeedUser() {
  const existing = await prisma.user.findUnique({ where: { email: SEED_USER_EMAIL } })
  if (existing) return existing

  const passwordHash = await bcrypt.hash(SEED_USER_PASSWORD, 10)
  return prisma.user.create({
    data: {
      email: SEED_USER_EMAIL,
      passwordHash
    }
  })
}

const seedTrades = [
  {
    strategyName: 'Support/Resistance Breakout',
    instrument: 'BTCUSDT',
    direction: 'long',
    entryDatetime: '2024-10-02T09:15:00Z',
    exitDatetime: '2024-10-04T12:45:00Z',
    entryPrice: 62000,
    exitPrice: 64850,
    positionSize: 0.5,
    realizedPnl: 1425,
    rMultiple: 2.3
  },
  {
    strategyName: 'Support/Resistance Breakout',
    instrument: 'ETHUSDT',
    direction: 'short',
    entryDatetime: '2024-10-05T15:30:00Z',
    exitDatetime: '2024-10-06T10:00:00Z',
    entryPrice: 3360,
    exitPrice: 3295,
    positionSize: 10,
    realizedPnl: 650,
    rMultiple: 1.1
  },
  {
    strategyName: null,
    instrument: 'AAPL',
    direction: 'long',
    entryDatetime: '2024-10-07T14:00:00Z',
    exitDatetime: '2024-10-10T20:10:00Z',
    entryPrice: 182.4,
    exitPrice: 176.9,
    positionSize: 200,
    realizedPnl: -1100,
    rMultiple: -0.8
  },
  {
    strategyName: 'Elliott Wave Reversal',
    instrument: 'SPX500',
    direction: 'short',
    entryDatetime: '2024-10-12T08:30:00Z',
    exitDatetime: null,
    entryPrice: 5468,
    exitPrice: null,
    positionSize: 2,
    realizedPnl: null,
    rMultiple: null
  }
]

async function main() {
  console.log('🌱 Seeding trades...')

  const user = await getOrCreateSeedUser()

  const strategies = await prisma.strategy.findMany({
    where: { userId: user.id },
    select: { id: true, name: true }
  })
  const strategyMap = new Map(strategies.map((s) => [s.name, s.id]))

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
