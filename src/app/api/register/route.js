import { NextResponse } from 'next/server'
import prisma from '../../../../db/prisma.js'
import { signupSchema } from '../../../../shared-domain/auth/auth.schema.js'
import { hashPassword, createToken, setAuthCookie } from '../../../../lib/auth.js'

export async function POST(request) {
  try {
    const raw = await request.json().catch(() => null)
    const parsed = signupSchema.safeParse(raw)
    
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

    const { username, email, password } = parsed.data

    // Prüfen ob User bereits existiert
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    })

    if (existingUser) {
      const conflictField = existingUser.email === email ? 'email' : 'username'
      const conflictMessage = conflictField === 'email'
        ? 'Ein Benutzer mit dieser E-Mail existiert bereits'
        : 'Dieser Benutzername ist bereits vergeben'
      return NextResponse.json(
        {
          success: false,
          error: 'USER_EXISTS',
          message: conflictMessage,
          field: conflictField
        },
        { status: 409 }
      )
    }

    // Passwort hashen
    const passwordHash = await hashPassword(password)

    // User erstellen
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash
      }
    })

    // JWT Token erstellen
    const token = createToken({
      userId: user.id,
      email: user.email,
      username: user.username
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
              username: user.username,
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
