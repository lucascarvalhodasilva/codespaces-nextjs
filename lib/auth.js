import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import prisma from '../db/prisma.js'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me'
const TOKEN_NAME = 'auth_token'

/**
 * Hash ein Passwort mit bcrypt
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

/**
 * Vergleicht ein Plain-Text-Passwort mit einem Hash
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

/**
 * Erstellt ein JWT Token
 */
export function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d' // Token läuft nach 7 Tagen ab
  })
}

/**
 * Verifiziert ein JWT Token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

/**
 * Holt den aktuellen User aus dem Cookie (Server-side)
 * Gibt User-Objekt zurück oder null
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(TOKEN_NAME)?.value

    if (!token) {
      return null
    }

    const payload = verifyToken(token)
    if (!payload || !payload.userId) {
      return null
    }

    // User aus DB laden
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true, email: true, createdAt: true }
    })

    return user
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}

/**
 * Setzt das Auth-Cookie
 */
export function setAuthCookie(token) {
  const cookieStore = cookies()
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 Tage
    path: '/'
  })
}

/**
 * Löscht das Auth-Cookie
 */
export function deleteAuthCookie() {
  const cookieStore = cookies()
  cookieStore.delete(TOKEN_NAME)
}
