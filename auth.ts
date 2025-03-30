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
    maxAge: 3600,
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
            role: true,
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
          // Don't include the full image URL in the token, just a reference
          image: user.image ? 'has_image' : null,
          role: user.role?.name,
          role_id: user.role_id || undefined,
        }
      },
    }),
  ],

  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.role_id = user.role_id
        // Don't store the full image in the token
        token.has_image = !!user.image
      }
      if (trigger === "update" && session) {
        // Make sure we update all relevant fields from the session
        if (session.user.name) token.name = session.user.name
        if (session.user.email) token.email = session.user.email
        // Don't update the image in the token
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string | undefined
        session.user.role_id = token.role_id as string | undefined
        session.user.name = token.name
        session.user.email = token.email as string
        
        // If user has an image, fetch it from the database when needed
        // instead of storing it in the session
        if (token.has_image) {
          // We'll set image to true to indicate there is an image
          // but we won't store the actual URL in the session
          session.user.image = true as any;
        } else {
          session.user.image = null;
        }
      }
      return session
    },
    authorized: async ({ auth }) => {
      return !!auth
    },
  },
})
