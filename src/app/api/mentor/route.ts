import { NextResponse } from "next/server"
import { createMentorData, updateMentorData, deleteMentorData } from "@/lib/mentor"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Ensure profile_picture is a string or null
    if (data.profile_picture && typeof data.profile_picture !== "string") {
      data.profile_picture = null
    }

    const result = await createMentorData(data)

    if (result.success) {
      revalidatePath("/admin/dashboard/akun/mentor")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in mentor POST route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...mentorData } = data

    // Ensure profile_picture is a string or null
    if (mentorData.profile_picture && typeof mentorData.profile_picture !== "string") {
      mentorData.profile_picture = null
    }

    if (!id) {
      return NextResponse.json({ success: false, error: "Mentor ID is required" }, { status: 400 })
    }

    const result = await updateMentorData(id, mentorData)

    if (result.success) {
      revalidatePath("/admin/dashboard/akun/mentor")
      revalidatePath(`/admin/dashboard/akun/mentor/edit/${id}`)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in mentor PUT route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Mentor ID is required" }, { status: 400 })
    }

    const result = await deleteMentorData(id)

    if (result.success) {
      revalidatePath("/admin/dashboard/akun/mentor")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in mentor DELETE route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

