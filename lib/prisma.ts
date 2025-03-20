import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Configure Prisma client with connection retry logic
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection handling
    errorFormat: "pretty",
  })



if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma

