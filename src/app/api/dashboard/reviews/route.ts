import { NextResponse } from "next/server"
import { getUserCourseReviews, getUserEventReviews } from "@/lib/reviews"
import { auth } from "@/auth"

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the review type from the URL
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type === "course") {
      const result = await getUserCourseReviews()
      if (result.success) {
        return NextResponse.json({ success: true, data: result.data })
      } else {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
    } else if (type === "event") {
      const result = await getUserEventReviews()
      if (result.success) {
        return NextResponse.json({ success: true, data: result.data })
      } else {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }
    } else {
      // Get both types of reviews
      const courseResult = await getUserCourseReviews()
      const eventResult = await getUserEventReviews()

      return NextResponse.json({
        success: true,
        data: {
          courseReviews: courseResult.success ? courseResult.data : [],
          eventReviews: eventResult.success ? eventResult.data : [],
        },
      })
    }
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

