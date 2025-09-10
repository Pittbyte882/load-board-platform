"use client"

import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface RatingDisplayProps {
  rating: number
  totalRatings: number
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  className?: string
}

export function RatingDisplay({
  rating,
  totalRatings,
  size = "md",
  showCount = true,
  className = "",
}: RatingDisplayProps) {
  const starSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-6 w-6" : "h-4 w-4"
  const textSize = size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base"

  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className={`${starSize} text-yellow-500 fill-current`} />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className={`${starSize} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${starSize} text-yellow-500 fill-current`} />
            </div>
          </div>,
        )
      } else {
        stars.push(<Star key={i} className={`${starSize} text-gray-300`} />)
      }
    }

    return stars
  }

  if (totalRatings === 0) {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`${starSize} text-gray-300`} />
          ))}
        </div>
        <span className={`text-gray-500 ${textSize}`}>No ratings yet</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex space-x-1">{renderStars()}</div>
      <span className={`font-medium ${textSize}`}>{rating.toFixed(1)}</span>
      {showCount && (
        <Badge variant="secondary" className="text-xs">
          {totalRatings} {totalRatings === 1 ? "review" : "reviews"}
        </Badge>
      )}
    </div>
  )
}
