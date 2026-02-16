'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function LandingHeader() {
  const { theme } = useTheme()

  // Use white logo for dark theme, black logo for light theme
  const logoSrc =
    theme === 'dark' ? '/TBT_Logo_White.png' : '/TBT_Logo_Black.png'

  return (
    <header className="border-b border-white/10 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 relative">
            <Image
              src={logoSrc}
              alt="The Big Tip Logo"
              width={40}
              height={40}
              priority
              className="w-10 h-10 object-contain"
            />
          </div>
          <span className="font-black text-lg tracking-tight hidden sm:inline">
            The Big Tip
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg bg-primary hover:bg-primary/90 transition-colors"
          >
            Join Free
          </Link>
        </div>
      </div>
    </header>
  )
}
