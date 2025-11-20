import '@/styles/globals.css'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export const metadata = {
  title: 'Monorepo Web App',
  description: 'Next.js App Router in monorepo'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}