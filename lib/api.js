import { NextResponse } from 'next/server'
import { getCurrentUser } from './auth.js'

/**
 * Wrapper für geschützte API-Routes
 * Prüft automatisch die Authentifizierung
 */
export async function withAuth(handler) {
  return async (request, context) => {
    try {
      const user = await getCurrentUser()
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        )
      }

      // User an Handler weitergeben
      return await handler(request, context, user)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { success: false, message: 'Authentication error' },
        { status: 401 }
      )
    }
  }
}

/**
 * Standard Success Response
 */
export function successResponse(data, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}

/**
 * Standard Error Response
 */
export function errorResponse(message, status = 400) {
  return NextResponse.json(
    { success: false, message },
    { status }
  )
}

/**
 * Prisma Error Handler
 */
export function handlePrismaError(error) {
  console.error('Prisma error:', error)

  // Unique constraint violation
  if (error.code === 'P2002') {
    return errorResponse('Record with this value already exists', 409)
  }

  // Record not found
  if (error.code === 'P2025') {
    return errorResponse('Record not found', 404)
  }

  // Foreign key constraint failed
  if (error.code === 'P2003') {
    return errorResponse('Related record not found', 400)
  }

  return errorResponse('Database error', 500)
}

/**
 * Validierung Helper
 */
export function validateRequired(data, fields) {
  const missing = fields.filter(field => !data[field])
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}
