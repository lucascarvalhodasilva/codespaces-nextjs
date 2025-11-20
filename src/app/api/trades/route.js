import { NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth.js'
import prisma from '../../../../db/prisma.js'
import { validateTradePayload, normalizeTradePayload } from './_lib/validation.js'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      include: {
        strategy: {
          select: { id: true, name: true }
        }
      },
      orderBy: { entryDatetime: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: trades
    })
  } catch (error) {
    console.error('GET /api/trades error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
  const validationError = validateTradePayload(body)

    if (validationError) {
      return NextResponse.json(
        { success: false, message: validationError },
        { status: 400 }
      )
    }

  const normalizedPayload = normalizeTradePayload(body)

    if (normalizedPayload.strategyId) {
      const strategy = await prisma.strategy.findFirst({
        where: { id: normalizedPayload.strategyId, userId: user.id },
        select: { id: true }
      })

      if (!strategy) {
        return NextResponse.json(
          { success: false, message: 'Strategy not found' },
          { status: 404 }
        )
      }
    }

    const trade = await prisma.trade.create({
      data: {
        ...normalizedPayload,
        userId: user.id
      }
    })

    const tradeWithStrategy = await prisma.trade.findUnique({
      where: { id: trade.id },
      include: {
        strategy: { select: { name: true } }
      }
    })

    return NextResponse.json({
      success: true,
      data: tradeWithStrategy
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/trades error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
