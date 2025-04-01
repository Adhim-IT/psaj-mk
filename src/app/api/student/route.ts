import { NextResponse } from "next/server"
import { createStudentData, updateStudentData, deleteStudentData } from "@/lib/student"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await createStudentData(data)

    if (result.success) {
      revalidatePath("/admin/dashboard/akun/student")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in student POST route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...studentData } = data

    if (!id) {
      return NextResponse.json({ success: false, error: "Student ID is required" }, { status: 400 })
    }

    const result = await updateStudentData(id, studentData)

    if (result.success) {
      revalidatePath("/admin/dashboard/akun/student")
      revalidatePath(`/admin/dashboard/akun/student/edit/${id}`)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in student PUT route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Student ID is required" }, { status: 400 })
    }

    const result = await deleteStudentData(id)

    if (result.success) {
      revalidatePath("/admin/dashboard/akun/student")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in student DELETE route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

