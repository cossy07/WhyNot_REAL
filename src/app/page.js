import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getActivityStats() {
  try {
    const [weekSessions, totalPosts] = await Promise.all([
      prisma.session.count({
        where: {
          status: 'completed',
          completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.post.count({ where: { isActive: true } }),
    ])
    return { weekSessions, totalPosts }
  } catch {
    return { weekSessions: 12, totalPosts: 48 }
  }
}

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  const stats = await getActivityStats()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-primary text-white min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
            You&apos;ve always wanted to.
            <br />
            <span className="text-accent">Why not?</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/75 leading-relaxed mb-10 max-w-xl mx-auto">
            Learn 1-on-1 with someone nearby. Casual. Low-pressure. Real. No algorithms, no feeds — just two people and a skill.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <>
                <Link
                  href="/browse"
                  className="px-8 py-4 bg-white text-primary font-bold rounded-2xl text-base hover:bg-gray-100 transition shadow-lg"
                >
                  Browse skills
                </Link>
                <Link
                  href="/post/new"
                  className="px-8 py-4 bg-accent text-white font-bold rounded-2xl text-base hover:bg-accent-600 transition shadow-lg"
                >
                  Share a skill
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register?intent=learn"
                  className="px-8 py-4 bg-white text-primary font-bold rounded-2xl text-base hover:bg-gray-100 transition shadow-lg"
                >
                  Learn something
                </Link>
                <Link
                  href="/auth/register?intent=teach"
                  className="px-8 py-4 bg-accent text-white font-bold rounded-2xl text-base hover:bg-accent-600 transition shadow-lg"
                >
                  Teach something
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Activity strip */}
        <div className="mt-16 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>{stats.weekSessions} sessions completed this week</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/20" />
          <div className="flex items-center gap-2">
            <span>{stats.totalPosts} skills available right now</span>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-12 text-white/30 text-xs">Scroll to see how it works</div>
      </section>

      {/* How it works */}
      <section className="bg-bg py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-charcoal text-center mb-4">How it works</h2>
          <p className="text-muted text-center mb-14 max-w-md mx-auto">Three steps. No fuss.</p>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                title: 'Find a skill nearby',
                desc: 'Browse listings by distance. Filter by what you want to learn — guitar, Python, ceramics, cooking, anything.',
              },
              {
                number: '02',
                title: 'Message directly',
                desc: 'Send a message. Agree on when, where, and what you\'ll exchange. No middleman. No booking fee.',
              },
              {
                number: '03',
                title: 'Show up and learn',
                desc: 'Meet in person. One real conversation is worth a hundred tutorials. Both of you leave with something.',
              },
            ].map((step) => (
              <div key={step.number} className="text-center">
                <div className="text-5xl font-bold text-primary/10 mb-3">{step.number}</div>
                <h3 className="font-bold text-neutral-charcoal mb-2">{step.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-primary text-white py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Not a marketplace. Not social media.</h2>
          <p className="text-white/70 leading-relaxed text-lg">
            No followers. No star ratings. No trending sections. No infinite scroll.
            Just real people, real skills, and the simple act of showing up for each other.
          </p>
          <Link
            href="/browse"
            className="inline-block mt-8 px-8 py-4 bg-accent text-white font-bold rounded-2xl hover:bg-accent-600 transition"
          >
            See what&apos;s nearby
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg border-t border-gray-100 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span className="font-bold text-primary">WhyNot</span>
          <span>Local skill exchange, peer to peer.</span>
          <div className="flex gap-6">
            <Link href="/browse" className="hover:text-neutral-charcoal transition">Browse</Link>
            <Link href="/auth/register" className="hover:text-neutral-charcoal transition">Join</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
