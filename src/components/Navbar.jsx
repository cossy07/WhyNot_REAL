'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import clsx from 'clsx'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isLanding = pathname === '/'

  const navLinks = session
    ? [
        { href: '/browse', label: 'Browse' },
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/messages', label: 'Messages' },
      ]
    : []

  return (
    <nav
      className={clsx(
        'w-full z-50 border-b',
        isLanding
          ? 'bg-primary border-primary-700'
          : 'bg-surface border-gray-100 sticky top-0 shadow-sm'
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className={clsx(
            'text-xl font-bold tracking-tight',
            isLanding ? 'text-white' : 'text-primary'
          )}
        >
          WhyNot
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'text-sm font-medium transition-colors',
                isLanding
                  ? 'text-white/80 hover:text-white'
                  : 'text-muted hover:text-neutral-charcoal',
                pathname.startsWith(link.href) &&
                  (isLanding ? 'text-white' : 'text-primary')
              )}
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/post/new"
                className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-600 transition"
              >
                + Post a skill
              </Link>
              <Link href={`/profile/${session.user.id}`}>
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary font-bold text-sm flex items-center justify-center">
                  {session.user.name?.[0]?.toUpperCase()}
                </div>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className={clsx(
                  'text-sm font-medium transition-colors',
                  isLanding ? 'text-white/70 hover:text-white' : 'text-muted hover:text-neutral-charcoal'
                )}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className={clsx(
                  'text-sm font-medium transition-colors',
                  isLanding ? 'text-white/80 hover:text-white' : 'text-muted hover:text-neutral-charcoal'
                )}
              >
                Sign in
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-600 transition"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className={clsx('w-5 space-y-1', isLanding ? 'text-white' : '')}>
            <span className={clsx('block h-0.5 w-5', isLanding ? 'bg-white' : 'bg-neutral-charcoal')} />
            <span className={clsx('block h-0.5 w-5', isLanding ? 'bg-white' : 'bg-neutral-charcoal')} />
            <span className={clsx('block h-0.5 w-5', isLanding ? 'bg-white' : 'bg-neutral-charcoal')} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-gray-100 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-neutral-charcoal hover:text-primary py-1"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <>
              <Link
                href="/post/new"
                className="block w-full text-center py-2.5 bg-accent text-white text-sm font-semibold rounded-xl"
                onClick={() => setMenuOpen(false)}
              >
                + Post a skill
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block w-full text-left text-sm text-muted py-1"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="block text-sm font-medium text-neutral-charcoal py-1" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link href="/auth/register" className="block w-full text-center py-2.5 bg-accent text-white text-sm font-semibold rounded-xl" onClick={() => setMenuOpen(false)}>Get started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
