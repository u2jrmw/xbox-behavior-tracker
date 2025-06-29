import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function seedDatabase() {
  try {
    console.log('Seeding database...')

    // Create a parent user
    const hashedParentPassword = await bcrypt.hash('parent123', 10)
    const parentUser = await prisma.user.upsert({
      where: { username: 'parent' },
      update: {},
      create: {
        username: 'parent',
        password: hashedParentPassword,
        role: 'PARENT',
        email: 'parent@example.com'
      }
    })

    // Create a child user
    const hashedChildPassword = await bcrypt.hash('child123', 10)
    const childUser = await prisma.user.upsert({
      where: { username: 'alex' },
      update: {},
      create: {
        username: 'alex',
        password: hashedChildPassword,
        role: 'CHILD'
      }
    })

    // Create a child profile
    const child = await prisma.child.upsert({
      where: { username: 'alex' },
      update: {},
      create: {
        name: 'Alex',
        username: 'alex',
        dailyAllowance: 180, // 3 hours
        currentTime: 120,    // 2 hours remaining
        parentId: parentUser.id,
        userId: childUser.id
      }
    })

    // Create some sample time entries
    await prisma.timeEntry.createMany({
      data: [
        {
          childId: child.id,
          amount: -30,
          reason: 'Did not clean room as asked',
          type: 'DEDUCTION',
          userId: parentUser.id
        },
        {
          childId: child.id,
          amount: -30,
          reason: 'Argued with parents',
          type: 'DEDUCTION',
          userId: parentUser.id
        },
        {
          childId: child.id,
          amount: 30,
          reason: 'Completed homework without being asked',
          type: 'ADDITION',
          userId: parentUser.id
        },
        {
          childId: child.id,
          amount: 180,
          reason: 'Daily allowance reset',
          type: 'RESET',
          userId: parentUser.id
        }
      ]
    })

    console.log('Database seeded successfully!')
    console.log('Parent login: username="parent", password="parent123"')
    console.log('Child login: username="alex", password="child123"')

  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
} 