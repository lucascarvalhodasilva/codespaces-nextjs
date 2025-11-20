import { withAuth, successResponse, errorResponse, handlePrismaError, validateRequired } from '../../../../lib/api.js'
import prisma from '../../../../db/prisma.js'

// GET /api/journal - Alle Journal-Einträge
export const GET = withAuth(async (request, context, user) => {
  try {
    // TODO: Prisma JournalEntry Model erstellen
    // const entries = await prisma.journalEntry.findMany({
    //   where: { userId: user.id },
    //   orderBy: { createdAt: 'desc' }
    // })

    const entries = []
    return successResponse(entries)
  } catch (error) {
    return handlePrismaError(error)
  }
})

// POST /api/journal - Neuen Eintrag erstellen
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json()
    
    // Validierung
    validateRequired(body, ['title', 'content'])

    // TODO: Prisma create
    // const entry = await prisma.journalEntry.create({
    //   data: {
    //     ...body,
    //     userId: user.id
    //   }
    // })

    return successResponse({ message: 'Journal entry created (TODO)' }, 201)
  } catch (error) {
    if (error.message.includes('Missing required fields')) {
      return errorResponse(error.message, 400)
    }
    return handlePrismaError(error)
  }
})
