import { NextResponse } from 'next/server'
import prisma from '../../../../db/prisma.js'
import { loginSchema } from '../../../../shared-domain/auth/auth.schema.js'
import { verifyPassword, createToken, setAuthCookie } from '../../../../lib/auth.js'

export async function POST(request) {
  try {
    const raw = await request.json().catch(() => null)
    const parsed = loginSchema.safeParse(raw)
    
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          issues: parsed.error.issues
        },
        { status: 400 }
      )
    }

    const { identifier, password } = parsed.data

    // User aus DB laden (Email oder Username)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'E-Mail oder Passwort ungültig'
        },
        { status: 401 }
      )
    }

    // Passwort prüfen
    const isValid = await verifyPassword(password, user.passwordHash)
    
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'E-Mail oder Passwort ungültig'
        },
        { status: 401 }
      )
    }

    // JWT Token erstellen
    const token = createToken({
      userId: user.id,
      email: user.email,
      username: user.username
    })

    // Cookie setzen
    setAuthCookie(token)

    // Response mit User-Daten (ohne Passwort)
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        }
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: 'Ein Fehler ist aufgetreten'
      },
      { status: 500 }
    )
  }
}