import { NextResponse } from "next/server"
import { getCourseTransactions } from "@/lib/course-transaksi-admin"

export async function GET() {
  try {
    const result = await getCourseTransactions({ page: 1, limit: 5 })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
  }
}
