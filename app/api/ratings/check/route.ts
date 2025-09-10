import { type NextRequest, NextResponse } from "next/server"
import { ratingStore } from "@/lib/rating-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const raterId = searchParams.get("raterId")
    const ratedUserId = searchParams.get("ratedUserId")
    const loadId = searchParams.get("loadId")

    if (!raterId || !ratedUserId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const canRate = ratingStore.canUserRate(raterId, ratedUserId, loadId || undefined)
    const existingRating = loadId ? ratingStore.getLoadRating(raterId, ratedUserId, loadId) : null

    return NextResponse.json({
      canRate,
      existingRating,
    })
  } catch (error) {
    console.error("Error checking rating eligibility:", error)
    return NextResponse.json({ error: "Failed to check rating eligibility" }, { status: 500 })
  }
}
