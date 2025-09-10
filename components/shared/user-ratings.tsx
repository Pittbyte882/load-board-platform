"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarInitials } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star, Plus } from "lucide-react"
import { RatingDisplay } from "./rating-display"
import { RatingForm } from "./rating-form"
import type { Rating, UserRatingStats } from "@/lib/rating-store"

interface UserRatingsProps {
  userId: string
  userName: string
  userRole: "broker" | "carrier" | "dispatcher"
  currentUserId: string
  currentUserName: string
  currentUserRole: "broker" | "carrier" | "dispatcher"
  loadId?: string
  showRateButton?: boolean
}

export function UserRatings({
  userId,
  userName,
  userRole,
  currentUserId,
  currentUserName,
  currentUserRole,
  loadId,
  showRateButton = true,
}: UserRatingsProps) {
  const [userStats, setUserStats] = useState<UserRatingStats | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [showAllRatings, setShowAllRatings] = useState(false)
  const [canRate, setCanRate] = useState(false)
  const [existingRating, setExistingRating] = useState<Rating | null>(null)

  useEffect(() => {
    fetchUserRatings()
    checkRatingEligibility()
  }, [userId, currentUserId, loadId])

  const fetchUserRatings = async () => {
    try {
      setIsLoading(true)

      // Fetch user stats
      const statsResponse = await fetch(`/api/ratings?type=stats&userId=${userId}`)
      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        setUserStats(stats)
      }

      // Fetch user ratings
      const ratingsResponse = await fetch(`/api/ratings?type=received&userId=${userId}`)
      if (ratingsResponse.ok) {
        const ratingsData = await ratingsResponse.json()
        setRatings(ratingsData)
      }
    } catch (error) {
      console.error("Error fetching ratings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkRatingEligibility = async () => {
    if (currentUserId === userId) {
      setCanRate(false)
      return
    }

    try {
      const params = new URLSearchParams({
        raterId: currentUserId,
        ratedUserId: userId,
      })

      if (loadId) {
        params.append("loadId", loadId)
      }

      const response = await fetch(`/api/ratings/check?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCanRate(data.canRate)
        setExistingRating(data.existingRating)
      }
    } catch (error) {
      console.error("Error checking rating eligibility:", error)
    }
  }

  const handleSubmitRating = async (rating: number, comment: string) => {
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raterId: currentUserId,
          raterName: currentUserName,
          raterRole: currentUserRole,
          ratedUserId: userId,
          ratedUserName: userName,
          ratedUserRole: userRole,
          rating,
          comment,
          loadId,
        }),
      })

      if (response.ok) {
        setShowRatingForm(false)
        fetchUserRatings()
        checkRatingEligibility()
        alert("Rating submitted successfully!")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      alert("Failed to submit rating. Please try again.")
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "broker":
        return "bg-blue-100 text-blue-800"
      case "carrier":
        return "bg-green-100 text-green-800"
      case "dispatcher":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Ratings & Reviews</span>
            </CardTitle>
            {showRateButton && (canRate || existingRating) && (
              <Button variant="outline" size="sm" onClick={() => setShowRatingForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {existingRating ? "Update Rating" : "Rate User"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {userStats && userStats.totalRatings > 0 ? (
            <>
              {/* Overall Rating */}
              <div className="text-center">
                <RatingDisplay
                  rating={userStats.averageRating}
                  totalRatings={userStats.totalRatings}
                  size="lg"
                  className="justify-center"
                />
              </div>

              {/* Rating Breakdown */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Rating Breakdown</h4>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center space-x-2">
                    <span className="text-sm w-8">{star}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{
                          width: `${
                            userStats.totalRatings > 0
                              ? (
                                  userStats.ratingBreakdown[star as keyof typeof userStats.ratingBreakdown] /
                                    userStats.totalRatings
                                ) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {userStats.ratingBreakdown[star as keyof typeof userStats.ratingBreakdown]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Recent Reviews */}
              {userStats.recentRatings.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Recent Reviews</h4>
                    {ratings.length > 3 && (
                      <Button variant="ghost" size="sm" onClick={() => setShowAllRatings(true)}>
                        View All ({ratings.length})
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {userStats.recentRatings.slice(0, 3).map((rating) => (
                      <div key={rating.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarInitials name={rating.raterName} />
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{rating.raterName}</p>
                              <Badge className={getRoleColor(rating.raterRole)} variant="secondary">
                                {rating.raterRole}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <RatingDisplay rating={rating.rating} totalRatings={0} size="sm" showCount={false} />
                            <p className="text-xs text-gray-500">{formatDate(rating.createdAt)}</p>
                          </div>
                        </div>
                        {rating.comment && <p className="text-sm text-gray-700">{rating.comment}</p>}
                        {rating.loadId && <p className="text-xs text-gray-500 mt-1">Load: {rating.loadId}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings yet</h3>
              <p className="text-gray-500 mb-4">This user hasn't received any ratings yet.</p>
              {showRateButton && canRate && (
                <Button onClick={() => setShowRatingForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Be the first to rate
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Form Dialog */}
      <Dialog open={showRatingForm} onOpenChange={setShowRatingForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate {userName}</DialogTitle>
          </DialogHeader>
          <RatingForm
            ratedUserId={userId}
            ratedUserName={userName}
            ratedUserRole={userRole}
            raterId={currentUserId}
            raterName={currentUserName}
            raterRole={currentUserRole}
            loadId={loadId}
            onSubmit={handleSubmitRating}
            onCancel={() => setShowRatingForm(false)}
            existingRating={
              existingRating
                ? {
                    rating: existingRating.rating,
                    comment: existingRating.comment,
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>

      {/* All Ratings Dialog */}
      <Dialog open={showAllRatings} onOpenChange={setShowAllRatings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Ratings for {userName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarInitials name={rating.raterName} />
                    </Avatar>
                    <div>
                      <p className="font-medium">{rating.raterName}</p>
                      <Badge className={getRoleColor(rating.raterRole)} variant="secondary">
                        {rating.raterRole}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <RatingDisplay rating={rating.rating} totalRatings={0} showCount={false} />
                    <p className="text-sm text-gray-500">{formatDate(rating.createdAt)}</p>
                  </div>
                </div>
                {rating.comment && <p className="text-gray-700 mb-2">{rating.comment}</p>}
                {rating.loadId && <p className="text-sm text-gray-500">Load: {rating.loadId}</p>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
