import './globals.css'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Navbar from '@/components/Navbar'
import SessionProvider from '@/components/SessionProvider'

export const metadata = {
  title: 'WhyNot — Skill Exchange Near You',
  description: 'Learn 1-on-1 with someone nearby. Casual. Low-pressure. Real.',
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <Navbar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
