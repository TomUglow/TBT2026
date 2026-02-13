import { NextResponse } from 'next/server'

const API_BASE = "https://api.the-odds-api.com/v4"
const API_KEY = process.env.THE_ODDS_API_KEY

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

let scoresCache: { data: ScoreGame[]; timestamp: number } = {
  data: [],
  timestamp: 0,
}

const SCORES_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchScoresForSport(
  sportKey: string,
  sportLabel: string,
  daysFrom: number = 1
): Promise<ScoreGame[]> {
  if (!API_KEY) {
    console.log('No API key configured for scores')
    return []
  }

  try {
    const url = `${API_BASE}/sports/${sportKey}/scores?apiKey=${API_KEY}&daysFrom=${daysFrom}&dateFormat=iso`
    const res = await fetch(url)

    if (!res.ok) {
      if (res.status === 404 || res.status === 422) return []
      console.error(`Scores API error for ${sportKey}: ${res.status}`)
      return []
    }

    const data = await res.json()
    if (!Array.isArray(data)) return []

    return data.map((game: any) => ({
      id: game.id,
      sport: sportLabel,
      sportKey,
      homeTeam: game.home_team,
      awayTeam: game.away_team,
      commenceTime: game.commence_time,
      completed: game.completed || false,
      scores: game.scores || null,
      lastUpdate: game.last_update || null,
    }))
  } catch (err) {
    console.error(`Error fetching scores for ${sportKey}:`, err)
    return []
  }
}

async function getAllScores(): Promise<ScoreGame[]> {
  const now = Date.now()
  
  // Return cache if valid
  if (now - scoresCache.timestamp < SCORES_CACHE_TTL && scoresCache.data.length > 0) {
    return scoresCache.data
  }

  const coreSports: [string, string][] = [
    ["basketball_nba", "NBA"],
    ["americanfootball_nfl", "NFL"],
    ["aussierules_afl", "AFL"],
    ["rugbyleague_nrl", "NRL"],
    ["soccer_epl", "Premier League"],
    ["soccer_usa_mls", "MLS"],
  ]

  const results = await Promise.all(
    coreSports.map(([key, label]) => fetchScoresForSport(key, label, 3))
  )

  const allGames = results.flat()

  // Sort: live/upcoming first, then recent results
  const recentResults = allGames
    .filter((g) => g.completed && g.scores)
    .sort((a, b) => new Date(b.commenceTime).getTime() - new Date(a.commenceTime).getTime())

  const liveAndUpcoming = allGames
    .filter((g) => !g.completed)
    .sort((a, b) => new Date(a.commenceTime).getTime() - new Date(b.commenceTime).getTime())

  const combined = [...liveAndUpcoming, ...recentResults]

  scoresCache = { data: combined, timestamp: now }
  return combined
}

export async function GET() {
  try {
    const scores = await getAllScores()
    return NextResponse.json(scores)
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    )
  }
}
