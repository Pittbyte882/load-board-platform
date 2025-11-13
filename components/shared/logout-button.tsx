"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { showConfirmWithLogo, showToastWithLogo } from "@/components/ui/custom-toasts"

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
    //  Replace confirm() with custom toast
    showConfirmWithLogo(
      "Confirm Logout",
      "Are you sure you want to log out?",
      async () => {
        // This runs when user clicks "OK"
        setIsLoggingOut(true)
        try {
          await logout()
          window.location.href = "/login"
        } catch (error) {
          console.error("Logout failed:", error)
          showToastWithLogo({
            title: "Logout Failed",
            message: "Please try again.",
            type: 'error'
          })
          setIsLoggingOut(false)
        }
      },
      () => {
        // This runs when user clicks "Cancel" (optional)
        console.log("Logout cancelled")
      }
    )
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