import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex flex-col items-center gap-6 max-w-md mx-auto text-center px-4">
        <div className="relative">
          <h1 className="text-9xl font-bold text-amber-500/20">404</h1>
          <p className="text-2xl font-bold text-white -mt-12">Page Not Found</p>
        </div>
        <p className="text-slate-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
