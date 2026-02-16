import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { joinByCodeSchema } from '@/lib/validations'
import { apiError, apiSuccess, requireAuth } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

/**
 * Join a competition using an invite code
 * POST /api/competitions/join-by-code
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = requireAuth(session)
    if (userId instanceof Response) return userId

    const body = await request.json()

    // Validate input
    const result = joinByCodeSchema.safeParse(body)
    if (!result.success) {
      console.error('Join code validation error:', result.error.errors)
      return apiError('Invalid invite code', 400)
    }

    const { inviteCode } = result.data

    // Find competition by invite code
    const competition = await prisma.competition.findUnique({
      where: { inviteCode },
    })

    if (!competition) {
      return apiError('Invalid or expired invite code', 404)
    }

    // Check if user is already a member
    const existing = await prisma.competitionUser.findUnique({
      where: {
        userId_competitionId: {
          userId,
          competitionId: competition.id,
        },
      },
    })

    if (existing) {
      return apiError('You are already a member of this competition', 409)
    }

    // Add user to competition
    await prisma.competitionUser.create({
      data: {
        userId,
        competitionId: competition.id,
      },
    })

    return apiSuccess(
      {
        success: true,
        message: 'Successfully joined competition',
        competitionId: competition.id,
      },
      201
    )
  } catch (error) {
    console.error('Error joining competition by code:', error)
    return apiError('Failed to join competition', 500)
  }
}
