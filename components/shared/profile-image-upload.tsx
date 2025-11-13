"use client"

import { useState, useRef } from "react"
import { Avatar, AvatarInitials, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { showToastWithLogo } from "@/components/ui/custom-toasts"
import { Camera, Upload, Trash2, Loader2 } from "lucide-react"

interface ProfileImageUploadProps {
  userId: string
  userName: string
  currentImageUrl?: string
  onImageUpdate: (imageUrl: string | null) => void
  size?: "sm" | "md" | "lg" | "xl"
}

export function ProfileImageUpload({
  userId,
  userName,
  currentImageUrl,
  onImageUpdate,
  size = "xl"
}: ProfileImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20",
    xl: "h-24 w-24"
  }

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-2xl"
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToastWithLogo({
      title: "Invalid File",
      message: "Please select an image file.",
      type: 'info'
    })
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToastWithLogo({
      title: "File Too Large",
      message: "Image must be less than 2MB.",
      type: 'info'
    })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload image')
      }

      const data = await response.json()
      setImageUrl(data.imageUrl)
      onImageUpdate(data.imageUrl)
      showToastWithLogo({
      title: "Image Updated!",
      message: "Your profile image has been updated successfully.",
      type: 'success'
    })
    } catch (error) {
      console.error('Upload error:', error)
      showToastWithLogo({
      title: "Upload Failed",
      message: error instanceof Error ? error.message : "Failed to upload image.",
      type: 'error'
    })

    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your profile image?')) return

    setIsDeleting(true)

    try {
      const response = await fetch('/api/profile/upload-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Failed to delete image')
      }

      setImageUrl(null)
      onImageUpdate(null)
      showToastWithLogo({
      title: "Image Removed!",
      message: "Your profile image has been removed successfully.",
      type: 'success'
    })
    } catch (error) {
      console.error('Delete error:', error)
      showToastWithLogo({
      title: "Remove Failed",
      message: "Failed to remove image. Please try again.",
      type: 'error'
    })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className={sizeClasses[size]}>
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt={userName} />
          ) : (
            <AvatarInitials name={userName} className={textSizeClasses[size]} />
          )}
        </Avatar>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleUploadClick}
        >
          <Camera className="h-6 w-6 text-white" />
        </div>

        {/* Loading overlay */}
        {(isUploading || isDeleting) && (
          <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          disabled={isUploading || isDeleting}
        >
          <Upload className="h-4 w-4 mr-2" />
          {imageUrl ? 'Change Photo' : 'Upload Photo'}
        </Button>

        {imageUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isUploading || isDeleting}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        JPG, PNG or WEBP. Max 2MB.
      </p>
    </div>
  )
}