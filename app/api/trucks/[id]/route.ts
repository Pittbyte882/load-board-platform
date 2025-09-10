import { NextRequest, NextResponse } from "next/server"
import { truckStore } from "@/lib/truck-store"

type TruckRouteContext = { params: Promise<{ id: string }> }

export async function GET(
  request: NextRequest,
  { params }: TruckRouteContext
) {
  try {
    const { id } = await params
    const truck = truckStore.getTruckById(id)

    if (!truck) {
      return NextResponse.json({ error: "Truck not found" }, { status: 404 })
    }

    return NextResponse.json(truck)
  } catch (error) {
    console.error("Error fetching truck:", error)
    return NextResponse.json(
      { error: "Failed to fetch truck" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: TruckRouteContext
) {
  try {
    const { id } = await params
    const truckData = await request.json()
    const updatedTruck = truckStore.updateTruck(id, truckData)

    if (!updatedTruck) {
      return NextResponse.json({ error: "Truck not found" }, { status: 404 })
    }

    return NextResponse.json(updatedTruck)
  } catch (error) {
    console.error("Error updating truck:", error)
    return NextResponse.json(
      { error: "Failed to update truck" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: TruckRouteContext
) {
  try {
    const { id } = await params
    const deleted = truckStore.deleteTruck(id)

    if (!deleted) {
      return NextResponse.json({ error: "Truck not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Truck deleted successfully" })
  } catch (error) {
    console.error("Error deleting truck:", error)
    return NextResponse.json(
      { error: "Failed to delete truck" },
      { status: 500 }
    )
  }
}
