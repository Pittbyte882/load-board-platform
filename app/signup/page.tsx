import { Suspense } from "react"
import { SignupPage } from "@/components/auth/signup-page"

function SignupPageWrapper() {
  return <SignupPage />
}

export default function Signup() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SignupPageWrapper />
    </Suspense>
  )
}
