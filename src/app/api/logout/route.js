import { NextResponse } from 'next/server'
import { deleteAuthCookie } from '../../../../lib/auth.js'

export async function POST() {
  try {
    deleteAuthCookie()
    
    return NextResponse.json({
      success: true,
      message: 'Erfolgreich abgemeldet'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR'
      },
      { status: 500 }
    )
  }
}
