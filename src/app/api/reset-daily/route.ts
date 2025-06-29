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

    const { childId } = await request.json()

    if (!childId) {
      return NextResponse.json({ error: "Child ID required" }, { status: 400 })
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

    // Reset the child's time to their daily allowance
    const updatedChild = await prisma.child.update({
      where: { id: childId },
      data: { 
        currentTime: child.dailyAllowance,
        lastReset: new Date()
      }
    })

    // Create a reset entry in the log
    await prisma.timeEntry.create({
      data: {
        childId,
        amount: child.dailyAllowance,
        reason: "Daily allowance reset",
        type: "RESET",
        userId: session.user.id
      }
    })

    return NextResponse.json(updatedChild)
  } catch (error) {
    console.error("Error resetting daily allowance:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Utility function to check and auto-reset all children (could be called by a cron job)
export async function GET() {
  try {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Find children who haven't been reset in the last 24 hours
    const childrenToReset = await prisma.child.findMany({
      where: {
        lastReset: {
          lt: yesterday
        }
      }
    })

    const resetPromises = childrenToReset.map(async (child) => {
      // Reset the child's time
      await prisma.child.update({
        where: { id: child.id },
        data: { 
          currentTime: child.dailyAllowance,
          lastReset: now
        }
      })

      // Create a reset entry
      await prisma.timeEntry.create({
        data: {
          childId: child.id,
          amount: child.dailyAllowance,
          reason: "Automatic daily reset",
          type: "RESET",
          userId: child.parentId
        }
      })
    })

    await Promise.all(resetPromises)

    return NextResponse.json({ 
      message: `Reset ${childrenToReset.length} children`,
      count: childrenToReset.length 
    })
  } catch (error) {
    console.error("Error in auto-reset:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 