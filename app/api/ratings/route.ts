import { type NextRequest, NextResponse } from "next/server"
import { ratingStore } from "@/lib/rating-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const raterId = searchParams.get("raterId")
    const type = searchParams.get("type") // "received" | "given" | "stats"

    if (type === "stats") {
      if (userId) {
        const stats = ratingStore.getUserStats(userId)
        return NextResponse.json(stats)
      } else {
        const allStats = ratingStore.getAllUserStats()
        return NextResponse.json(allStats)
      }
    }

    if (userId && type === "received") {
      const ratings = ratingStore.getUserRatings(userId)
      return NextResponse.json(ratings)
    }

    if (raterId && type === "given") {
      const ratings = ratingStore.getRatingsByUser(raterId)
      return NextResponse.json(ratings)
    }

    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
  } catch (error) {
    console.error("Error fetching ratings:", error)
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { raterId, raterName, raterRole, ratedUserId, ratedUserName, ratedUserRole, rating, comment, loadId } = body

    // Validate required fields
    if (!raterId || !raterName || !raterRole || !ratedUserId || !ratedUserName || !ratedUserRole || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate rating value
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Check if user can rate
    if (!ratingStore.canUserRate(raterId, ratedUserId, loadId)) {
      return NextResponse.json({ error: "You have already rated this user for this load" }, { status: 400 })
    }

    const newRating = ratingStore.submitRating({
      raterId,
      raterName,
      raterRole,
      ratedUserId,
      ratedUserName,
      ratedUserRole,
      rating,
      comment,
      loadId,
    })

    return NextResponse.json(newRating, { status: 201 })
  } catch (error) {
    console.error("Error submitting rating:", error)
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 })
  }
}
