import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import {LoginSchema } from "@/lib/zod"
import {compareSync} from "bcrypt-ts"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session:{
    strategy:"jwt"
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const validateFields = LoginSchema.safeParse(credentials)

        if (!validateFields.success) {
          return null
        }
        const { email, password } = validateFields.data
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        })
        if(!user || !user?.password){
          throw new Error("User not found")
        }

        const passowrdMatch = compareSync(password, user.password)
        if(!passowrdMatch) return null

        return user;
      },
    }),
  ]
})