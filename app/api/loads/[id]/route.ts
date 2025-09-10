import { type NextRequest, NextResponse } from "next/server"
import { updateLoad, deleteLoad, getLoadById } from "@/lib/loads-store"

type LoadRouteContext = { params: Promise<{ id: string }> }

export async function GET(
  request: NextRequest,
  { params }: LoadRouteContext
) {
  try {
    const { id } = await params
    const load = getLoadById(id)

    if (!load) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 })
    }

    return NextResponse.json(load)
  } catch (error) {
    console.error("Error fetching load:", error)
    return NextResponse.json({ error: "Failed to fetch load" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: LoadRouteContext
) {
  try {
    const { id } = await params
    const updates = await request.json()
    console.log("API: Updating load", id, "with:", updates)

    const updatedLoad = updateLoad(id, updates)

    if (!updatedLoad) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 })
    }

    console.log("API: Load updated successfully:", updatedLoad.id)
    return NextResponse.json({
      success: true,
      load: updatedLoad,
      message: "Load updated successfully"
    })
  } catch (error) {
    console.error("API: Error updating load:", error)
    return NextResponse.json({ error: "Failed to update load" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: LoadRouteContext
) {
  try {
    const { id } = await params
    console.log("API: Deleting load:", id)

    const deleted = deleteLoad(id)

    if (!deleted) {
      return NextResponse.json({ error: "Load not found" }, { status: 404 })
    }

    console.log("API: Load deleted successfully:", id)
    return NextResponse.json({
      success: true,
      message: "Load deleted successfully"
    })
  } catch (error) {
    console.error("API: Error deleting load:", error)
    return NextResponse.json({ error: "Failed to delete load" }, { status: 500 })
  }
}

