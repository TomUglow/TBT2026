import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export interface ScoreGame {
  id: string
  sport: string
  sportKey: string
  homeTeam: string
  awayTeam: string
  commenceTime: string
  completed: boolean
  scores: { name: string; score: string }[] | null
  lastUpdate: string | null
}

// Use global to survive Next.js hot-module reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _scoresCache: { data: ScoreGame[]; expiresAt: number } | undefined
}
if (!global._scoresCache) {
  global._scoresCache = { data: [], expiresAt: 0 }
}

const MAX_CACHE_MS = 60 * 60 * 1000 // 1 hour ceiling

// Returns date in YYYYMMDD format for ESPN API date parameter
function espnDate(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0].replace(/-/g, '')
}

async function espnFetch(sportPath: string, date: string): Promise<any> {
  const url = `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/scoreboard?dates=${date}`
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error(`ESPN fetch error [${sportPath} ${date}]:`, err)
    return null
  }
}

function normalizeESPNEvents(data: any, sport: string, sportKey: string): ScoreGame[] {
  if (!Array.isArray(data?.events)) return []
  const games: ScoreGame[] = []

  for (const event of data.events) {
    try {
      const comp = event.competitions?.[0]
      if (!comp) continue

      const home = comp.competitors?.find((c: any) => c.homeAway === 'home')
      const away = comp.competitors?.find((c: any) => c.homeAway === 'away')
      if (!home || !away) continue

      const statusType = event.status?.type
      const completed = statusType?.completed === true
      const isLive = statusType?.state === 'in'
      const hasScore = (completed || isLive) && home.score != null && away.score != null

      games.push({
        id: `espn-${sportKey}-${event.id}`,
        sport,
        sportKey,
        homeTeam: home.team.displayName,
        awayTeam: away.team.displayName,
        commenceTime: event.date,
        completed,
        scores: hasScore
          ? [
              { name: home.team.displayName, score: String(home.score) },
              { name: away.team.displayName, score: String(away.score) },
            ]
          : null,
        lastUpdate: null,
      })
    } catch {
      continue
    }
  }
  return games
}

// ESPN sport paths — no API key required
const ESPN_SPORTS = [
  { path: 'basketball/nba',          sport: 'Basketball', sportKey: 'basketball_nba' },
  { path: 'hockey/nhl',              sport: 'Ice Hockey', sportKey: 'icehockey_nhl' },
  { path: 'soccer/eng.1',            sport: 'Soccer',     sportKey: 'soccer_epl' },
  { path: 'australian-football/afl', sport: 'AFL',        sportKey: 'aussierules_afl' },
  { path: 'rugby-league/nrl',        sport: 'NRL',        sportKey: 'rugbyleague_nrl' },
]

async function getAllScores(): Promise<ScoreGame[]> {
  const now = Date.now()

  // Return cache if still valid
  if (global._scoresCache!.expiresAt > now && global._scoresCache!.data.length > 0) {
    return global._scoresCache!.data
  }

  // Smart cache TTL: expire at next upcoming event start so cache refreshes when games go live
  const nextEvent = await prisma.event.findFirst({
    where: { status: 'upcoming', eventDate: { gt: new Date() } },
    orderBy: { eventDate: 'asc' },
    select: { eventDate: true },
  })

  // Look back 4 days (handles sport breaks/off days) plus today and tomorrow
  // 6 dates × 5 sports = 30 parallel requests, no API key needed
  const dates = [espnDate(-7), espnDate(-6), espnDate(-5), espnDate(-4), espnDate(-3), espnDate(-2), espnDate(-1), espnDate(0), espnDate(1)]
  const fetches = ESPN_SPORTS.flatMap(({ path, sport, sportKey }) =>
    dates.map((d) =>
      espnFetch(path, d)
        .then((data) => normalizeESPNEvents(data, sport, sportKey))
        .catch(() => []),
    ),
  )

  const results = await Promise.all(fetches)

  // Deduplicate (same event id won't appear across multiple date ranges)
  const seen = new Set<string>()
  const allGames: ScoreGame[] = []
  for (const game of results.flat()) {
    if (!seen.has(game.id)) {
      seen.add(game.id)
      allGames.push(game)
    }
  }

  // Sort: live/upcoming first (chronological), completed most recent first
  const liveAndUpcoming = allGames
    .filter((g) => !g.completed)
    .sort((a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime())

  const recentResults = allGames
    .filter((g) => g.completed && g.scores)
    .sort((a, b) => new Date(b.commenceTime).getTime() - new Date(a.commenceTime).getTime())

  const combined = [...liveAndUpcoming, ...recentResults]

  // Cache until next event starts, max 1 hour
  const nextEventMs = nextEvent ? new Date(nextEvent.eventDate).getTime() : Infinity
  const expiresAt = Math.min(nextEventMs, now + MAX_CACHE_MS)
  global._scoresCache = { data: combined, expiresAt }

  return combined
}

export async function GET() {
  try {
    const scores = await getAllScores()
    return NextResponse.json(scores)
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 })
  }
}
