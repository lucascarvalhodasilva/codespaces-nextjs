import { NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth.js'
import prisma from '../../../../../db/prisma.js'

// GET /api/strategies/[id] - Einzelne Strategie abrufen
export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const id = parseInt(params.id)

    const strategy = await prisma.strategy.findFirst({
      where: { id, userId: user.id },
      include: {
        technicals: {
          orderBy: { displayOrder: 'asc' }
        }
      }
    })

    if (!strategy) {
      return NextResponse.json(
        { success: false, message: 'Strategy not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: strategy
    })
  } catch (error) {
    console.error('GET /api/strategies/[id] error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/strategies/[id] - Strategie aktualisieren
export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const id = parseInt(params.id)
    const body = await request.json()
    const { name, shortCode, setupDescription, notes, isActive, archivedReason, technicals } = body

    // Prüfen ob Strategie existiert
  const existing = await prisma.strategy.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Strategy not found' },
        { status: 404 }
      )
    }

    // Update mit Transaction für Technicals
    const strategy = await prisma.$transaction(async (tx) => {
      // Strategie updaten
      const updated = await tx.strategy.update({
        where: { id },
        data: {
          name: name || existing.name,
          shortCode: shortCode !== undefined ? shortCode : existing.shortCode,
          setupDescription: setupDescription !== undefined ? setupDescription : existing.setupDescription,
          notes: notes !== undefined ? notes : existing.notes,
          isActive: isActive !== undefined ? isActive : existing.isActive,
          archivedReason: archivedReason !== undefined ? archivedReason : existing.archivedReason
        }
      })

      // Optional: Technicals neu erstellen wenn mitgegeben
      if (technicals) {
        // Alte löschen
        await tx.strategyTechnical.deleteMany({
          where: { strategyId: id }
        })
        // Neue erstellen
        await tx.strategyTechnical.createMany({
          data: technicals.map(t => ({
            ...t,
            strategyId: id
          }))
        })
      }

      // Komplette Strategie mit Technicals zurückgeben
      return tx.strategy.findFirst({
        where: { id, userId: user.id },
        include: { technicals: { orderBy: { displayOrder: 'asc' } } }
      })
    })

    return NextResponse.json({
      success: true,
      data: strategy
    })
  } catch (error) {
    console.error('PUT /api/strategies/[id] error:', error)
    
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

// DELETE /api/strategies/[id] - Strategie löschen
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const id = parseInt(params.id)

    // Prüfen ob existiert
  const existing = await prisma.strategy.findFirst({ where: { id, userId: user.id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Strategy not found' },
        { status: 404 }
      )
    }

    // Löschen (CASCADE löscht automatisch die Technicals)
    await prisma.strategy.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Strategy deleted successfully'
    })
  } catch (error) {
    console.error('DELETE /api/strategies/[id] error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
