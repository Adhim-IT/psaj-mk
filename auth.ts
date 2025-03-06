import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import { LoginSchema } from "@/lib/zod"
import { compareSync } from "bcrypt-ts"
import type { User } from "next-auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/register",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials): Promise<User | null> => {
        const validateFields = LoginSchema.safeParse(credentials)

        if (!validateFields.success) {
          return null
        }
        const { email, password } = validateFields.data
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
          include: {
            role: true, // Include role information
          },
        })
        if (!user || !user?.password) {
          throw new Error("redirect:/register")
        }

        const passwordMatch = compareSync(password, user.password)
        if (!passwordMatch) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role?.name, // Include role name in the token
          role_id: user.role_id || undefined, // Use undefined instead of null
        }
      },
    }),
  ],

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.role_id = user.role_id
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string | undefined
        session.user.role_id = token.role_id as string | undefined
      }
      return session
    },
    authorized: async ({ auth }) => {
      return !!auth
    },
  },
})

