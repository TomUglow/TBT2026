import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'  

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const competitionId = searchParams.get('competitionId')

    if (!competitionId) {
      return NextResponse.json(
        { error: 'Competition ID required' },
        { status: 400 }
      )
    }

    const leaderboard = await prisma.competitionUser.findMany({
      where: {
        competitionId: competitionId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: {
        score: 'desc'
      }
    })

    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }))

    return NextResponse.json(rankedLeaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
