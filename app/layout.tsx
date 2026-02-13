import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { getServerSession } from 'next-auth'
import SessionProvider from '@/components/SessionProvider'
import { authOptions } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Big Tip - Sports Tipping Competition',
  description: 'Predict 50 sporting events. Win big. Prove you\'re the best.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch {
    // Session unavailable during static page generation (e.g. /_not-found)
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
