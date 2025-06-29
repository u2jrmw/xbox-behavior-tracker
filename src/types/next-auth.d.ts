import "next-auth"
import { Role } from "@prisma/client"

declare module "next-auth" {
  interface User {
    id: string
    username: string
    role: Role
    email?: string | null
    childProfile?: any
  }

  interface Session {
    user: {
      id: string
      username: string
      role: Role
      email?: string | null
      childProfile?: any
      name?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role
    username: string
    childProfile?: any
  }
} 