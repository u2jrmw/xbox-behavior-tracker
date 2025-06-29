import "next-auth"
import { Role } from "@prisma/client"

interface ChildProfile {
  id: string
  name: string
  username: string
  dailyAllowance: number
  currentTime: number
  lastReset: Date
  parentId: string
  userId?: string | null
  createdAt: Date
  updatedAt: Date
}

declare module "next-auth" {
  interface User {
    id: string
    username: string
    role: Role
    email?: string | null
    childProfile?: ChildProfile | null
  }

  interface Session {
    user: {
      id: string
      username: string
      role: Role
      email?: string | null
      childProfile?: ChildProfile | null
      name?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    username: string
    childProfile?: ChildProfile | null
  }
} 