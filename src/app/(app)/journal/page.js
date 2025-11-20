import { redirect } from 'next/navigation'
import { getCurrentUser } from '../../../../lib/auth.js'

export default async function JournalPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/landing')
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary-light mb-2">Journal</h1>
            <p className="text-primary-light/60">Dokumentiere deine Trading-Gedanken und Learnings</p>
          </div>
          <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-darkest font-semibold rounded-lg transition-colors">
            + New Entry
          </button>
        </div>

        <div className="bg-primary-dark rounded-xl border border-primary/30 p-8">
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📝</span>
            <h2 className="text-2xl font-bold text-primary-light mb-2">Your Journal is Empty</h2>
            <p className="text-primary-light/60 mb-6">Start documenting your trading journey and insights</p>
            <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-darkest font-semibold rounded-lg transition-colors">
              Write Your First Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
