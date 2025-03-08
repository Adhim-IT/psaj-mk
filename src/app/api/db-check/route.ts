import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Try a simple query to check if the database is connected
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
    })
  } catch (error) {
    console.error("Database connection error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to database. Please check your database configuration.",
      },
      { status: 500 },
    )
  }
}

