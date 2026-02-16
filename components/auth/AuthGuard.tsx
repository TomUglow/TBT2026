'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo skeleton */}
          <div className="flex justify-center mb-12">
            <div className="w-12 h-12 rounded-full bg-slate-700/50 animate-pulse"></div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-slate-700/50 rounded-lg animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-700/30 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-slate-700/30 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-slate-700/30 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>

          {/* Spinner */}
          <div className="flex justify-center mt-12">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-spin opacity-75"></div>
              <div className="absolute inset-1 bg-slate-800 rounded-full"></div>
              <div className="absolute inset-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  return <>{children}</>
}
