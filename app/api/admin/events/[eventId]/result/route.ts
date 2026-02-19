import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess, requireAdmin } from '@/lib/api-helpers'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const setResultSchema = z.object({
  winner: z.string().min(1, 'Winner is required'),
  score: z.string().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const adminId = requireAdmin(session)
    if (adminId instanceof Response) return adminId

    const { eventId } = params
    const body = await request.json()

    const result = setResultSchema.safeParse(body)
    if (!result.success) {
      return apiError('Invalid result data', 400)
    }

    const { winner, score } = result.data

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, status: true, options: true },
    })

    if (!event) {
      return apiError('Event not found', 404)
    }

    const options = Array.isArray(event.options) ? (event.options as string[]) : []
    if (options.length > 0 && !options.includes(winner)) {
      return apiError('Winner must be one of the event options', 400)
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update event
      await tx.event.update({
        where: { id: eventId },
        data: { winner, score: score || null, status: 'completed' },
      })

      // 2. Fetch all picks for this event
      const picks = await tx.pick.findMany({
        where: { eventId },
        select: { id: true, userId: true, competitionId: true, selectedTeam: true },
      })

      // 3. Update each pick
      for (const pick of picks) {
        const isCorrect = pick.selectedTeam === winner
        await tx.pick.update({
          where: { id: pick.id },
          data: { isCorrect, points: isCorrect ? 1 : 0 },
        })
      }

      // 4. Collect unique (userId, competitionId) pairs
      const pairs = new Map<string, { userId: string; competitionId: string }>()
      for (const pick of picks) {
        const key = `${pick.userId}:${pick.competitionId}`
        pairs.set(key, { userId: pick.userId, competitionId: pick.competitionId })
      }

      // 5. Recalculate total score for each pair
      for (const { userId, competitionId } of pairs.values()) {
        const scoreResult = await tx.pick.aggregate({
          where: { userId, competitionId, isCorrect: true },
          _sum: { points: true },
        })

        const totalScore = scoreResult._sum.points ?? 0

        await tx.competitionUser.update({
          where: { userId_competitionId: { userId, competitionId } },
          data: { score: totalScore },
        })
      }
    })

    return apiSuccess({ success: true, winner })
  } catch (error) {
    console.error('Admin set result error:', error)
    return apiError('Failed to set result', 500)
  }
}
