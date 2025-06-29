import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create parent user
  const hashedParentPassword = await bcrypt.hash('parent123', 10)
  const parentUser = await prisma.user.create({
    data: {
      username: 'parent',
      password: hashedParentPassword,
      role: 'PARENT'
    }
  })

  // Create child user for Alex
  const hashedChildPassword = await bcrypt.hash('child123', 10)
  const alexUser = await prisma.user.create({
    data: {
      username: 'alex',
      password: hashedChildPassword,
      role: 'CHILD'
    }
  })

  // Create child user for Ethan
  const hashedEthanPassword = await bcrypt.hash('ethan123', 10)
  const ethanUser = await prisma.user.create({
    data: {
      username: 'ethan',
      password: hashedEthanPassword,
      role: 'CHILD'
    }
  })

  // Create Alex child profile
  const alexChild = await prisma.child.create({
    data: {
      name: 'Alex',
      username: 'alex',
      dailyAllowance: 180,
      currentTime: 120,
      parentId: parentUser.id,
      userId: alexUser.id
    }
  })

  // Create Ethan child profile
  const ethanChild = await prisma.child.create({
    data: {
      name: 'Ethan',
      username: 'ethan',
      dailyAllowance: 180,
      currentTime: 90,
      parentId: parentUser.id,
      userId: ethanUser.id
    }
  })

  // Add some sample time entries for Alex
  await prisma.timeEntry.create({
    data: {
      childId: alexChild.id,
      amount: 30,
      reason: "Completed homework without being asked",
      type: "ADDITION",
      userId: parentUser.id
    }
  })

  await prisma.timeEntry.create({
    data: {
      childId: alexChild.id,
      amount: 15,
      reason: "Left dishes on table",
      type: "DEDUCTION",
      userId: parentUser.id
    }
  })

  // Add some sample time entries for Ethan
  await prisma.timeEntry.create({
    data: {
      childId: ethanChild.id,
      amount: 20,
      reason: "Helped with chores",
      type: "ADDITION",
      userId: parentUser.id
    }
  })

  await prisma.timeEntry.create({
    data: {
      childId: ethanChild.id,
      amount: 45,
      reason: "Didn't clean room as asked",
      type: "DEDUCTION",
      userId: parentUser.id
    }
  })

  console.log('Database seeded successfully!')
  console.log('Parent login: username="parent", password="parent123"')
  console.log('Alex login: username="alex", password="child123"')
  console.log('Ethan login: username="ethan", password="ethan123"')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 