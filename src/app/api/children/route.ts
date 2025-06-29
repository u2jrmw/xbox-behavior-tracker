import { NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerAuthSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role === "PARENT") {
      // Parents can see all their children
      const children = await prisma.child.findMany({
        where: {
          parentId: session.user.id
        },
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

      return NextResponse.json(children)
    } else if (session.user.role === "CHILD") {
      // Children can only see their own profile
      const child = await prisma.child.findFirst({
        where: {
          userId: session.user.id
        },
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

      if (!child) {
        return NextResponse.json({ error: "Child profile not found" }, { status: 404 })
      }

      // Return as an array to match the expected format in the child dashboard
      return NextResponse.json([child])
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  } catch (error) {
    console.error("Error fetching children:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    
    if (!session || session.user.role !== "PARENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, username, password, dailyAllowance } = await request.json()

    if (!name || !username) {
      return NextResponse.json({ error: "Name and username are required" }, { status: 400 })
    }

    // Create user account for child if password provided
    let userId = null
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role: "CHILD"
        }
      })
      userId = user.id
    }

    const child = await prisma.child.create({
      data: {
        name,
        username,
        dailyAllowance: dailyAllowance || 180,
        currentTime: dailyAllowance || 180,
        parentId: session.user.id,
        userId
      }
    })

    return NextResponse.json(child)
  } catch (error) {
    console.error("Error creating child:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerAuthSession()
    
    if (!session || session.user.role !== "PARENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const childId = searchParams.get("childId")

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

    // Delete associated user account if it exists
    if (child.userId) {
      await prisma.user.delete({
        where: { id: child.userId }
      })
    }

    // Delete the child (this will cascade delete time entries due to our schema)
    await prisma.child.delete({
      where: { id: childId }
    })

    return NextResponse.json({ message: "Child deleted successfully" })
  } catch (error) {
    console.error("Error deleting child:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 