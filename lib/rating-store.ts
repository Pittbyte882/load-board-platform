export interface Rating {
  id: string
  raterId: string
  raterName: string
  raterRole: "broker" | "carrier" | "dispatcher"
  ratedUserId: string
  ratedUserName: string
  ratedUserRole: "broker" | "carrier" | "dispatcher"
  rating: number // 1-5 stars
  comment?: string
  loadId?: string // Optional reference to specific load
  createdAt: string
  updatedAt: string
}

export interface UserRatingStats {
  userId: string
  userName: string
  userRole: "broker" | "carrier" | "dispatcher"
  averageRating: number
  totalRatings: number
  ratingBreakdown: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  recentRatings: Rating[]
}

class RatingStore {
  private ratings: Rating[] = []
  private userStats: Map<string, UserRatingStats> = new Map()

  constructor() {
    this.initializeDemoData()
  }

  private initializeDemoData() {
    // Demo ratings data
    const demoRatings: Rating[] = [
      // Ratings for broker-1 (Sarah Wilson)
      {
        id: "rating-1",
        raterId: "carrier-1",
        raterName: "Mike Johnson",
        raterRole: "carrier",
        ratedUserId: "broker-1",
        ratedUserName: "Sarah Wilson",
        ratedUserRole: "broker",
        rating: 5,
        comment: "Excellent communication and fair rates. Always pays on time.",
        loadId: "LD-001",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "rating-2",
        raterId: "dispatcher-1",
        raterName: "Jennifer Martinez",
        raterRole: "dispatcher",
        ratedUserId: "broker-1",
        ratedUserName: "Sarah Wilson",
        ratedUserRole: "broker",
        rating: 4,
        comment: "Good broker to work with. Professional and reliable.",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      // Ratings for carrier-1 (Mike Johnson)
      {
        id: "rating-3",
        raterId: "broker-1",
        raterName: "Sarah Wilson",
        raterRole: "broker",
        ratedUserId: "carrier-1",
        ratedUserName: "Mike Johnson",
        ratedUserRole: "carrier",
        rating: 5,
        comment: "Outstanding carrier! Always on time and takes great care of freight.",
        loadId: "LD-001",
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: "rating-4",
        raterId: "dispatcher-1",
        raterName: "Jennifer Martinez",
        raterRole: "dispatcher",
        ratedUserId: "carrier-1",
        ratedUserName: "Mike Johnson",
        ratedUserRole: "carrier",
        rating: 4,
        comment: "Reliable driver, good communication throughout the delivery.",
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      // Ratings for dispatcher-1 (Jennifer Martinez)
      {
        id: "rating-5",
        raterId: "broker-1",
        raterName: "Sarah Wilson",
        raterRole: "broker",
        ratedUserId: "dispatcher-1",
        ratedUserName: "Jennifer Martinez",
        ratedUserRole: "dispatcher",
        rating: 5,
        comment: "Excellent dispatcher! Manages carriers very well and great communication.",
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: "rating-6",
        raterId: "carrier-1",
        raterName: "Mike Johnson",
        raterRole: "carrier",
        ratedUserId: "dispatcher-1",
        ratedUserName: "Jennifer Martinez",
        ratedUserRole: "dispatcher",
        rating: 4,
        comment: "Good dispatcher, always keeps me informed about load updates.",
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      },
    ]

    this.ratings = demoRatings
    this.calculateUserStats()
  }

  private calculateUserStats() {
    const statsMap = new Map<string, UserRatingStats>()

    // Initialize stats for all users
    const users = [
      { id: "broker-1", name: "Sarah Wilson", role: "broker" as const },
      { id: "carrier-1", name: "Mike Johnson", role: "carrier" as const },
      { id: "dispatcher-1", name: "Jennifer Martinez", role: "dispatcher" as const },
    ]

    users.forEach((user) => {
      statsMap.set(user.id, {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        averageRating: 0,
        totalRatings: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recentRatings: [],
      })
    })

    // Calculate stats from ratings
    this.ratings.forEach((rating) => {
      const stats = statsMap.get(rating.ratedUserId)
      if (stats) {
        stats.totalRatings++
        stats.ratingBreakdown[rating.rating as keyof typeof stats.ratingBreakdown]++
        stats.recentRatings.push(rating)
      }
    })

    // Calculate average ratings and sort recent ratings
    statsMap.forEach((stats) => {
      if (stats.totalRatings > 0) {
        const totalScore = Object.entries(stats.ratingBreakdown).reduce(
          (sum, [rating, count]) => sum + Number.parseInt(rating) * count,
          0,
        )
        stats.averageRating = Math.round((totalScore / stats.totalRatings) * 10) / 10
      }

      // Sort recent ratings by date and keep only the 5 most recent
      stats.recentRatings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      stats.recentRatings = stats.recentRatings.slice(0, 5)
    })

    this.userStats = statsMap
  }

  // Submit a new rating
  submitRating(ratingData: Omit<Rating, "id" | "createdAt" | "updatedAt">): Rating {
    const newRating: Rating = {
      ...ratingData,
      id: `rating-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Check if user has already rated this person for this load
    const existingRatingIndex = this.ratings.findIndex(
      (r) =>
        r.raterId === ratingData.raterId && r.ratedUserId === ratingData.ratedUserId && r.loadId === ratingData.loadId,
    )

    if (existingRatingIndex >= 0) {
      // Update existing rating
      this.ratings[existingRatingIndex] = {
        ...this.ratings[existingRatingIndex],
        rating: ratingData.rating,
        comment: ratingData.comment,
        updatedAt: new Date().toISOString(),
      }
    } else {
      // Add new rating
      this.ratings.push(newRating)
    }

    this.calculateUserStats()

    // Dispatch event for real-time updates
    window.dispatchEvent(
      new CustomEvent("ratingSubmitted", {
        detail: { rating: newRating },
      }),
    )

    return newRating
  }

  // Get ratings for a specific user
  getUserRatings(userId: string): Rating[] {
    return this.ratings
      .filter((rating) => rating.ratedUserId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Get ratings by a specific user
  getRatingsByUser(raterId: string): Rating[] {
    return this.ratings
      .filter((rating) => rating.raterId === raterId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  // Get user rating statistics
  getUserStats(userId: string): UserRatingStats | null {
    return this.userStats.get(userId) || null
  }

  // Get all user stats (for admin or public viewing)
  getAllUserStats(): UserRatingStats[] {
    return Array.from(this.userStats.values())
  }

  // Check if user can rate another user
  canUserRate(raterId: string, ratedUserId: string, loadId?: string): boolean {
    // Users cannot rate themselves
    if (raterId === ratedUserId) return false

    // If loadId is provided, check if they haven't already rated for this load
    if (loadId) {
      const existingRating = this.ratings.find(
        (r) => r.raterId === raterId && r.ratedUserId === ratedUserId && r.loadId === loadId,
      )
      return !existingRating
    }

    return true
  }

  // Get rating for specific load between two users
  getLoadRating(raterId: string, ratedUserId: string, loadId: string): Rating | null {
    return (
      this.ratings.find((r) => r.raterId === raterId && r.ratedUserId === ratedUserId && r.loadId === loadId) || null
    )
  }
}

export const ratingStore = new RatingStore()
