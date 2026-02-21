import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess, requireAuth } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = requireAuth(session)
    if (userId instanceof Response) return userId

    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get('competitionId')

    if (!competitionId) {
      return apiError('Competition ID required', 400)
    }

    // Verify user is a member of this competition
    const membership = await prisma.competitionUser.findUnique({
      where: { userId_competitionId: { userId, competitionId } },
    })
    if (!membership) {
      return apiError('Not a member of this competition', 403)
    }

    const leaderboard = await prisma.competitionUser.findMany({
      where: { competitionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            // Exclude email - PII that should not be exposed in leaderboard
          }
        }
      },
      orderBy: { score: 'desc' },
    })

    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))

    return apiSuccess(rankedLeaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return apiError('Failed to fetch leaderboard', 500)
  }
}
