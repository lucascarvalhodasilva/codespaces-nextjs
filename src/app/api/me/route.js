import { NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth.js'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Nicht authentifiziert'
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { user }
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR'
      },
      { status: 500 }
    )
  }
}
