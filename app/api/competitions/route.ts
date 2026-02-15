import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    const competitions = await prisma.competition.findMany({
      where: {
        OR: [
          { isPublic: true },
          ...(session?.user
            ? [{ users: { some: { userId: (session.user as any).id } } }]
            : []),
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true },
        },
        _count: {
          select: { users: true, events: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Check which competitions the current user has joined
    const joinedCompIds = new Set<string>()
    if (session?.user) {
      const memberships = await prisma.competitionUser.findMany({
        where: { userId: (session.user as any).id },
        select: { competitionId: true },
      })
      memberships.forEach((m) => joinedCompIds.add(m.competitionId))
    }

    const result = competitions.map((comp) => ({
      ...comp,
      participantCount: comp._count.users,
      eventCount: comp._count.events,
      isJoined: joinedCompIds.has(comp.id),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching competitions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch competitions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, startDate, eventIds } = body

    // Validate required fields
    const trimmedName = typeof name === 'string' ? name.trim() : ''
    if (!trimmedName || trimmedName.length > 100) {
      return NextResponse.json(
        { error: 'Name is required and must be 100 characters or less' },
        { status: 400 }
      )
    }

    if (!Array.isArray(eventIds) || eventIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one event must be selected' },
        { status: 400 }
      )
    }

    const parsedStartDate = new Date(startDate)
    if (isNaN(parsedStartDate.getTime()) || parsedStartDate <= new Date()) {
      return NextResponse.json(
        { error: 'Tips close date must be a valid future date' },
        { status: 400 }
      )
    }

    // Verify all events exist and haven't completed
    const validEvents = await prisma.event.findMany({
      where: {
        id: { in: eventIds },
        status: { not: 'completed' },
      },
      select: { id: true, eventDate: true },
      orderBy: { eventDate: 'desc' },
    })

    if (validEvents.length !== eventIds.length) {
      return NextResponse.json(
        { error: 'Some selected events are invalid or already completed' },
        { status: 400 }
      )
    }

    // endDate = latest event date
    const endDate = validEvents[0].eventDate

    if (parsedStartDate > endDate) {
      return NextResponse.json(
        { error: 'Tips close date must be before the last event date' },
        { status: 400 }
      )
    }

    // Create competition, link events, and auto-join creator in a transaction
    const competition = await prisma.$transaction(async (tx) => {
      const comp = await tx.competition.create({
        data: {
          name: trimmedName,
          description: typeof description === 'string' ? description.trim() || null : null,
          entryFee: 0,
          prizePool: 0,
          startDate: parsedStartDate,
          endDate,
          isPublic: false,
          maxEvents: eventIds.length,
          status: 'upcoming',
          ownerId: session.user.id,
        },
      })

      await tx.competitionEvent.createMany({
        data: eventIds.map((eventId: string) => ({
          competitionId: comp.id,
          eventId,
        })),
      })

      await tx.competitionUser.create({
        data: {
          userId: session.user.id,
          competitionId: comp.id,
        },
      })

      return comp
    })

    return NextResponse.json(
      { success: true, competitionId: competition.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating competition:', error)
    return NextResponse.json(
      { error: 'Failed to create competition' },
      { status: 500 }
    )
  }
}
