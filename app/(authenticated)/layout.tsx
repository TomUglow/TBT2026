'use client'

import Navbar from '@/components/layout/Navbar'
import LiveScoresTicker from '@/components/layout/LiveScoresTicker'
import AuthGuard from '@/components/auth/AuthGuard'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <LiveScoresTicker />
        <main>{children}</main>
      </div>
    </AuthGuard>
  )
}
