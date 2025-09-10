"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

interface RatingFormProps {
  ratedUserId: string
  ratedUserName: string
  ratedUserRole: "broker" | "carrier" | "dispatcher"
  raterId: string
  raterName: string
  raterRole: "broker" | "carrier" | "dispatcher"
  loadId?: string
  onSubmit: (rating: number, comment: string) => void
  onCancel: () => void
  existingRating?: {
    rating: number
    comment?: string
  }
}

export function RatingForm({
  ratedUserId,
  ratedUserName,
  ratedUserRole,
  raterId,
  raterName,
  raterRole,
  loadId,
  onSubmit,
  onCancel,
  existingRating,
}: RatingFormProps) {
  const [rating, setRating] = useState(existingRating?.rating || 0)
  const [comment, setComment] = useState(existingRating?.comment || "")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(rating, comment)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "broker":
        return "text-blue-600"
      case "carrier":
        return "text-green-600"
      case "dispatcher":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">
          {existingRating ? "Update Rating" : "Rate"}{" "}
          <span className={getRoleColor(ratedUserRole)}>{ratedUserName}</span>
        </CardTitle>
        <p className="text-sm text-gray-600 capitalize">
          {ratedUserRole} {loadId && `• Load ${loadId}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div>
          <Label className="text-sm font-medium">Rating</Label>
          <div className="flex space-x-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredRating || rating) ? "text-yellow-500 fill-current" : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <Label htmlFor="comment" className="text-sm font-medium">
            Comment (Optional)
          </Label>
          <Textarea
            id="comment"
            placeholder="Share your experience working with this user..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="mt-2"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button onClick={handleSubmit} disabled={rating === 0 || isSubmitting} className="flex-1">
            {isSubmitting ? "Submitting..." : existingRating ? "Update Rating" : "Submit Rating"}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1 bg-transparent">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
