import { NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth.js'
import prisma from '../../../../../db/prisma.js'
import { validateTradePayload, normalizeTradePayload } from '../_lib/validation.js'

function parseTradeId(param) {
  const id = Number(param)
  if (!Number.isInteger(id) || id <= 0) {
    return null
  }
  return id
}

async function ensureOwnership(tradeId, userId) {
  return prisma.trade.findFirst({ where: { id: tradeId, userId }, select: { id: true } })
}

async function ensureStrategyOwnership(strategyId, userId) {
  if (!strategyId) return true
  const strategy = await prisma.strategy.findFirst({ where: { id: strategyId, userId }, select: { id: true } })
  return Boolean(strategy)
}

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const tradeId = parseTradeId(params.id)
    if (!tradeId) {
      return NextResponse.json({ success: false, message: 'Invalid trade id' }, { status: 400 })
    }

    const ownership = await ensureOwnership(tradeId, user.id)
    if (!ownership) {
      return NextResponse.json({ success: false, message: 'Trade not found' }, { status: 404 })
    }

    const body = await request.json()
    const validationError = validateTradePayload(body)
    if (validationError) {
      return NextResponse.json({ success: false, message: validationError }, { status: 400 })
    }

    const normalizedPayload = normalizeTradePayload(body)

    const ownsStrategy = await ensureStrategyOwnership(normalizedPayload.strategyId, user.id)
    if (!ownsStrategy) {
      return NextResponse.json({ success: false, message: 'Strategy not found' }, { status: 404 })
    }

    await prisma.trade.update({
      where: { id: tradeId },
      data: normalizedPayload
    })

    const updatedTrade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { strategy: { select: { name: true } } }
    })

    return NextResponse.json({ success: true, data: updatedTrade })
  } catch (error) {
    console.error('PATCH /api/trades/[id] error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const tradeId = parseTradeId(params.id)
    if (!tradeId) {
      return NextResponse.json({ success: false, message: 'Invalid trade id' }, { status: 400 })
    }

    const ownership = await ensureOwnership(tradeId, user.id)
    if (!ownership) {
      return NextResponse.json({ success: false, message: 'Trade not found' }, { status: 404 })
    }

    await prisma.trade.delete({ where: { id: tradeId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/trades/[id] error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
