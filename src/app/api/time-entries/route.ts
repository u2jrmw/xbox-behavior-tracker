import { NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    
    if (!session || session.user.role !== "PARENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { childId, amount, reason, type } = await request.json()

    if (!childId || !amount || !reason || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify the child belongs to this parent
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        parentId: session.user.id
      }
    })

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 })
    }

    // Create the time entry
    const timeEntry = await prisma.timeEntry.create({
      data: {
        childId,
        amount: type === "DEDUCTION" ? -Math.abs(amount) : Math.abs(amount),
        reason,
        type,
        userId: session.user.id
      }
    })

    // Update the child's current time
    const newCurrentTime = Math.max(0, child.currentTime + timeEntry.amount)
    
    await prisma.child.update({
      where: { id: childId },
      data: { currentTime: newCurrentTime }
    })

    // Return the updated child with recent entries
    const updatedChild = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        timeEntries: {
          orderBy: {
            createdAt: "desc"
          },
          take: 10,
          include: {
            createdBy: {
              select: {
                username: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedChild)
  } catch (error) {
    console.error("Error creating time entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get("childId")

    if (!childId) {
      return NextResponse.json({ error: "Child ID required" }, { status: 400 })
    }

    // Check if user can access this child's data
    let canAccess = false
    if (session.user.role === "PARENT") {
      const child = await prisma.child.findFirst({
        where: {
          id: childId,
          parentId: session.user.id
        }
      })
      canAccess = !!child
    } else if (session.user.role === "CHILD") {
      const child = await prisma.child.findFirst({
        where: {
          id: childId,
          userId: session.user.id
        }
      })
      canAccess = !!child
    }

    if (!canAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: { childId },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: {
          select: {
            username: true
          }
        }
      },
      take: 50
    })

    return NextResponse.json(timeEntries)
  } catch (error) {
    console.error("Error fetching time entries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 