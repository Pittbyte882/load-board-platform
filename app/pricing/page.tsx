"use client"

import { useAuth } from "@/lib/auth-context"
import { CarrierDashboard } from "@/components/carrier/carrier-dashboard"
import { BrokerDashboard } from "@/components/broker/broker-dashboard"
import { DispatcherDashboard } from "@/components/dispatcher/dispatcher-dashboard"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { LandingPage } from "@/components/landing/landing-page"

export default function PricingPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  // Redirect authenticated users to their dashboard
  switch (user.role) {
    case "carrier":
      return <CarrierDashboard />
    case "broker":
      return <BrokerDashboard />
    case "dispatcher":
      return <DispatcherDashboard />
    case "admin":
      return <AdminDashboard />
    default:
      return <LandingPage />
  }
}
