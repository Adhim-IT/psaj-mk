import { NextResponse } from "next/server"
import { createWriterData, updateWriterData, deleteWriterData } from "@/lib/writer"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await createWriterData(data)

    if (result.success) {
      revalidatePath("/admin/dashboard/akun/writer")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in writer POST route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...writerData } = data

    if (!id) {
      return NextResponse.json({ success: false, error: "Writer ID is required" }, { status: 400 })
    }

    const result = await updateWriterData(id, writerData)

    if (result.success) {
      revalidatePath("/admin/dashboard/akun/writer")
      revalidatePath(`/admin/dashboard/akun/writer/edit/${id}`)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in writer PUT route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Writer ID is required" }, { status: 400 })
    }

    const result = await deleteWriterData(id)

    if (result.success) {
      revalidatePath("/admin/dashboard/akun/writer")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in writer DELETE route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

