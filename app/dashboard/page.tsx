"use client"

import { useAuth } from "@/lib/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { BrokerDashboard } from "@/components/broker/broker-dashboard"
import { CarrierDashboard } from "@/components/carrier/carrier-dashboard"
import { DispatcherDashboard } from "@/components/dispatcher/dispatcher-dashboard"
import { redirect } from "next/navigation"

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user) {
    redirect("/login")
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "admin":
        return <AdminDashboard />
      case "broker":
        return <BrokerDashboard />
      case "carrier":
        return <CarrierDashboard />
      case "dispatcher":
        return <DispatcherDashboard />
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid user role</h2>
              <p className="text-gray-600">Please contact support for assistance.</p>
            </div>
          </div>
        )
    }
  }

  return <MainLayout>{renderDashboard()}</MainLayout>
}
