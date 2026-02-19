import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess, requireAdmin } from '@/lib/api-helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const adminId = requireAdmin(session)
    if (adminId instanceof Response) return adminId

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { competitions: true, picks: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return apiSuccess(users)
  } catch (error) {
    console.error('Admin users GET error:', error)
    return apiError('Failed to fetch users', 500)
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const adminId = requireAdmin(session)
    if (adminId instanceof Response) return adminId

    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('userId')

    if (!targetUserId) {
      return apiError('userId query parameter required', 400)
    }

    if (targetUserId === adminId) {
      return apiError('Cannot delete your own account', 400)
    }

    await prisma.user.delete({ where: { id: targetUserId } })

    return apiSuccess({ success: true })
  } catch (error) {
    console.error('Admin users DELETE error:', error)
    return apiError('Failed to delete user', 500)
  }
}
