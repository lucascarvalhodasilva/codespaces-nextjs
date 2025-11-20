import { NextResponse } from 'next/server'
import prisma from '../../../../db/prisma.js'

export async function GET() {
  // Return sample users (from DB if exists, else fallback)
  let users = []
  try {
    users = await prisma.user.findMany()
  } catch (e) {
    users = [
      { id: 1, email: 'alice@example.com' },
      { id: 2, email: 'bob@example.com' }
    ]
  }
  return NextResponse.json(users)
}