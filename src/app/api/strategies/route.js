import { NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth.js'
import prisma from '../../../../db/prisma.js'

// GET /api/strategies - Alle Strategien des Users abrufen
export async function GET(request) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const strategies = await prisma.strategy.findMany({
      where: { userId: user.id },
      include: {
        technicals: {
          orderBy: { displayOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: strategies
    })
  } catch (error) {
    console.error('GET /api/strategies error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/strategies - Neue Strategie erstellen
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
    const { name, shortCode, setupDescription, notes, isActive, technicals } = body

    // Validierung
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      )
    }

    // Strategie mit Technicals erstellen
    const strategy = await prisma.strategy.create({
      data: {
        userId: user.id,
        name,
        shortCode: shortCode || null,
        setupDescription: setupDescription || null,
        notes: notes || null,
        isActive: isActive !== undefined ? isActive : 1,
        technicals: {
          create: technicals || []
        }
      },
      include: {
        technicals: true
      }
    })

    return NextResponse.json({
      success: true,
      data: strategy
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/strategies error:', error)
    
    // Unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Strategy with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
