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

async function seedStrategies() {
  console.log('🌱 Seeding strategies...')

  try {
    const user = await getOrCreateSeedUser()

    await prisma.trade.updateMany({
      where: { userId: user.id },
      data: { strategyId: null }
    })

    await prisma.strategy.deleteMany({ where: { userId: user.id } })

    // Strategy 1: Elliott Wave Reversal
    const strategy1 = await prisma.strategy.create({
      data: {
        userId: user.id,
        name: "Elliott Wave Reversal",
        shortCode: "REV_1D",
        setupDescription: "Wait for completed 5-wave impulse, identify ABC correction, enter on wave 5 completion with tight stop.",
        notes: "Best on daily timeframe. Requires clear wave structure.",
        isActive: 1,
        technicals: {
          create: [
            {
              indicator: "Elliott Wave",
              timeframe: "1D",
              condition: "Completed 5-wave impulse pattern",
              displayOrder: 1,
              isRequired: 1
            },
            {
              indicator: "RSI",
              timeframe: "1D",
              condition: "RSI > 70 (overbought) or RSI < 30 (oversold)",
              displayOrder: 2,
              isRequired: 1
            },
            {
              indicator: "Volume",
              timeframe: "1D",
              condition: "Decreasing volume on wave 5",
              displayOrder: 3,
              isRequired: 0
            }
          ]
        }
      }
    })
    console.log('✅ Created:', strategy1.name)

    // Strategy 2: Support/Resistance Breakout
    const strategy2 = await prisma.strategy.create({
      data: {
        userId: user.id,
        name: "Support/Resistance Breakout",
        shortCode: "BRK_H4",
        setupDescription: "Identify key S/R levels, wait for consolidation, enter on breakout with volume confirmation.",
        notes: "Works well in trending markets. Avoid during low volatility.",
        isActive: 1,
        technicals: {
          create: [
            {
              indicator: "Support/Resistance",
              timeframe: "H4",
              condition: "Price testing key level 3+ times",
              displayOrder: 1,
              isRequired: 1
            },
            {
              indicator: "Volume",
              timeframe: "H4",
              condition: "Volume spike on breakout (>150% of average)",
              displayOrder: 2,
              isRequired: 1
            },
            {
              indicator: "Moving Average",
              timeframe: "H4",
              condition: "Price above 50 EMA for long, below for short",
              displayOrder: 3,
              isRequired: 0
            }
          ]
        }
      }
    })
    console.log('✅ Created:', strategy2.name)

    // Strategy 3: RSI Divergence Scalp
    const strategy3 = await prisma.strategy.create({
      data: {
        userId: user.id,
        name: "RSI Divergence Scalp",
        shortCode: "SCAL_M15",
        setupDescription: "Spot RSI divergence on 15min chart, enter on retest with tight 1:2 RR.",
        notes: "High frequency strategy. Requires quick execution.",
        isActive: 0,
        technicals: {
          create: [
            {
              indicator: "RSI",
              timeframe: "M15",
              condition: "Bullish or bearish divergence forming",
              displayOrder: 1,
              isRequired: 1
            },
            {
              indicator: "Price Action",
              timeframe: "M15",
              condition: "Higher high/lower low with RSI showing opposite",
              displayOrder: 2,
              isRequired: 1
            },
            {
              indicator: "Support/Resistance",
              timeframe: "M15",
              condition: "Divergence occurring at key S/R level",
              displayOrder: 3,
              isRequired: 1
            }
          ]
        }
      }
    })
    console.log('✅ Created:', strategy3.name)

    console.log('\n🎉 Seeding completed successfully for', user.email)
  } catch (error) {
    console.error('❌ Error seeding:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedStrategies()
