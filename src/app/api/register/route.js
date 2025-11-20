import { NextResponse } from 'next/server'
import prisma from '../../../../db/prisma.js'
import { loginSchema } from '../../../../shared-domain/auth/auth.schema.js'
import { hashPassword, createToken, setAuthCookie } from '../../../../lib/auth.js'

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

    const { email, password } = parsed.data

    // Prüfen ob User bereits existiert
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'USER_EXISTS',
          message: 'Ein Benutzer mit dieser E-Mail existiert bereits'
        },
        { status: 409 }
      )
    }

    // Passwort hashen
    const passwordHash = await hashPassword(password)

    // User erstellen
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash
      }
    })

    // JWT Token erstellen
    const token = createToken({
      userId: user.id,
      email: user.email
    })

    // Cookie setzen
    setAuthCookie(token)

    // Response mit User-Daten (ohne Passwort)
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt
          }
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
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
