import { redirect } from 'next/navigation'
import prisma from '../../../../db/prisma.js'
import { getCurrentUser } from '../../../../lib/auth.js'
import StrategiesClient from './StrategiesClient'

export default async function StrategiesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/landing')
  }

  // Load strategies with technical conditions ordered
  const strategies = await prisma.strategy.findMany({
    where: { userId: user.id },
    include: {
      technicals: {
        orderBy: { displayOrder: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <StrategiesClient strategies={strategies} />
      </div>
    </div>
  )
}
