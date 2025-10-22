"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  showIcon?: boolean
  className?: string
}

export function LogoutButton({ 
  variant = "outline", 
  size = "default",
  showIcon = true,
  className = ""
}: LogoutButtonProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out?")) return

    setIsLoggingOut(true)
    try {
      // Call logout from auth context
      await logout()
      
      // Force a hard redirect to login page
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout failed:", error)
      alert("Failed to log out. Please try again.")
      setIsLoggingOut(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Logging out...
        </>
      ) : (
        <>
          {showIcon && <LogOut className="h-4 w-4 mr-2" />}
          Log Out
        </>
      )}
    </Button>
  )
}