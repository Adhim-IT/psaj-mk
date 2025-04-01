import { NextResponse } from "next/server"
import { createRoleData, updateRoleData, deleteRoleData } from "@/lib/role"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await createRoleData(data)

    if (result.success) {
      revalidatePath("/admin/dashboard/akun/role")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in role POST route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    const { id, ...roleData } = data

    if (!id) {
      return NextResponse.json({ success: false, error: "Role ID is required" }, { status: 400 })
    }

    const result = await updateRoleData(id, roleData)

    if (result.success) {
      revalidatePath("/admin/dashboard/akun/role")
      revalidatePath(`/admin/dashboard/akun/role/edit/${id}`)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in role PUT route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Role ID is required" }, { status: 400 })
    }

    const result = await deleteRoleData(id)

    if (result.success) {
      revalidatePath("/admin/dashboard/akun/role")
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in role DELETE route:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}

