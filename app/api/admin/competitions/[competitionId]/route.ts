import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess, requireAdmin } from '@/lib/api-helpers'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateCompSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { competitionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const adminId = requireAdmin(session)
    if (adminId instanceof Response) return adminId

    const { competitionId } = params
    const body = await request.json()
    const result = updateCompSchema.safeParse(body)
    if (!result.success) {
      return apiError('Invalid competition data', 400)
    }

    const comp = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { id: true },
    })
    if (!comp) return apiError('Competition not found', 404)

    const updated = await prisma.competition.update({
      where: { id: competitionId },
      data: result.data,
      select: { id: true, name: true, description: true },
    })

    return apiSuccess(updated)
  } catch (error) {
    console.error('Admin competition PATCH error:', error)
    return apiError('Failed to update competition', 500)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { competitionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const adminId = requireAdmin(session)
    if (adminId instanceof Response) return adminId

    const { competitionId } = params

    const comp = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { id: true },
    })
    if (!comp) return apiError('Competition not found', 404)

    // Cascades to CompetitionUser, CompetitionEvent, Pick, Payment via schema
    await prisma.competition.delete({ where: { id: competitionId } })

    return apiSuccess({ success: true })
  } catch (error) {
    console.error('Admin competition DELETE error:', error)
    return apiError('Failed to delete competition', 500)
  }
}
