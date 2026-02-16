'use client'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-1 bg-slate-800 rounded-full"></div>
        </div>
        <p className="text-slate-300 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  )
}
