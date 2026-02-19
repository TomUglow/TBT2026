import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess, requireAdmin } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const adminId = requireAdmin(session)
    if (adminId instanceof Response) return adminId

    const { userId } = params
    const body = await request.json()

    if (typeof body.isAdmin !== 'boolean') {
      return apiError('isAdmin boolean field required', 400)
    }

    if (userId === adminId && body.isAdmin === false) {
      return apiError('Cannot remove your own admin status', 400)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: body.isAdmin },
      select: { id: true, email: true, username: true, isAdmin: true },
    })

    return apiSuccess(updated)
  } catch (error) {
    console.error('Admin toggle admin error:', error)
    return apiError('Failed to update user', 500)
  }
}
