"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, Calendar, CheckCircle, AlertTriangle, Gift, Clock, Zap, Star } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface SubscriptionData {
  planName: string
  status: "active" | "trial" | "expired" | "cancelled"
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  trialEndsAt?: string
  price: number
  features: string[]
  usageStats?: {
    loadsSearched: number
    maxLoads: number
    messagesUsed: number
    maxMessages: number
  }
}

export function SubscriptionPlan() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpgrading, setIsUpgrading] = useState(false)

  useEffect(() => {
    // Simulate API call to get subscription data
    const fetchSubscription = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock subscription data based on user
        const mockSubscription: SubscriptionData = {
          planName: "Carrier Pro",
          status: user?.subscription?.status || "trial",
          currentPeriodEnd:
            user?.subscription?.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: user?.subscription?.cancelAtPeriodEnd || false,
          trialEndsAt: user?.subscription?.trialEndsAt || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          price: 49,
          features: [
            "Unlimited load searches",
            "Advanced search filters",
            "Real-time notifications",
            "Mobile app access",
            "Route optimization",
            "Load tracking",
            "Document management",
            "Priority customer support",
          ],
          usageStats: {
            loadsSearched: 23,
            maxLoads: 50,
            messagesUsed: 8,
            maxMessages: 25,
          },
        }

        setSubscription(mockSubscription)
      } catch (error) {
        console.error("Failed to fetch subscription:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  const handleUpgrade = async () => {
    setIsUpgrading(true)
    try {
      // Simulate upgrade process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update subscription status
      if (subscription) {
        setSubscription({
          ...subscription,
          status: "active",
          trialEndsAt: undefined,
        })
      }

      alert("Successfully upgraded to full plan!")
    } catch (error) {
      console.error("Upgrade failed:", error)
      alert("Upgrade failed. Please try again.")
    } finally {
      setIsUpgrading(false)
    }
  }

  const handleExtendTrial = async () => {
    try {
      // Simulate trial extension
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (subscription?.trialEndsAt) {
        const newTrialEnd = new Date(subscription.trialEndsAt)
        newTrialEnd.setDate(newTrialEnd.getDate() + 7)

        setSubscription({
          ...subscription,
          trialEndsAt: newTrialEnd.toISOString(),
        })
      }

      alert("Trial extended by 7 days!")
    } catch (error) {
      console.error("Trial extension failed:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case "trial":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Gift className="h-3 w-3 mr-1" />
            Free Trial
          </Badge>
        )
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getDaysRemaining = (dateString: string) => {
    const endDate = new Date(dateString)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getUsagePercentage = (used: number, max: number) => {
    return Math.min(100, (used / max) * 100)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No subscription found</p>
        </CardContent>
      </Card>
    )
  }

  const isTrialActive = subscription.status === "trial" && subscription.trialEndsAt
  const trialDaysRemaining = isTrialActive ? getDaysRemaining(subscription.trialEndsAt!) : 0
  const isTrialExpiringSoon = trialDaysRemaining <= 3

  return (
    <div className="space-y-6">
      {/* Main Subscription Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {subscription.planName}
                {getStatusBadge(subscription.status)}
              </CardTitle>
              <CardDescription>
                {subscription.status === "active"
                  ? `$${subscription.price}/month • Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                  : subscription.status === "trial"
                    ? `Free trial • ${trialDaysRemaining} days remaining`
                    : "Subscription inactive"}
              </CardDescription>
            </div>
            <div className="text-right">
              {subscription.status === "active" && <div className="text-2xl font-bold">${subscription.price}</div>}
              {subscription.status === "trial" && <div className="text-2xl font-bold text-green-600">FREE</div>}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Trial Progress */}
          {isTrialActive && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trial Progress</span>
                <span className="text-sm text-gray-500">{14 - trialDaysRemaining} of 14 days used</span>
              </div>
              <Progress value={((14 - trialDaysRemaining) / 14) * 100} className="h-2" />

              {isTrialExpiringSoon && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Your trial expires in {trialDaysRemaining} days. Upgrade now to continue using all features.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Usage Stats for Trial Users */}
          {subscription.status === "trial" && subscription.usageStats && (
            <div className="space-y-4">
              <h4 className="font-medium">Trial Usage</h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Load Searches</span>
                    <span>
                      {subscription.usageStats.loadsSearched} / {subscription.usageStats.maxLoads}
                    </span>
                  </div>
                  <Progress
                    value={getUsagePercentage(subscription.usageStats.loadsSearched, subscription.usageStats.maxLoads)}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Messages Sent</span>
                    <span>
                      {subscription.usageStats.messagesUsed} / {subscription.usageStats.maxMessages}
                    </span>
                  </div>
                  <Progress
                    value={getUsagePercentage(
                      subscription.usageStats.messagesUsed,
                      subscription.usageStats.maxMessages,
                    )}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Plan Features */}
          <div>
            <h4 className="font-medium mb-3">Plan Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {subscription.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {subscription.status === "trial" && (
              <>
                <Button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  {isUpgrading ? (
                    "Upgrading..."
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Upgrade to Full Plan
                    </>
                  )}
                </Button>

                {trialDaysRemaining <= 5 && (
                  <Button onClick={handleExtendTrial} variant="outline" className="flex-1 bg-transparent">
                    <Gift className="h-4 w-4 mr-2" />
                    Extend Trial
                  </Button>
                )}
              </>
            )}

            {subscription.status === "active" && (
              <>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Change Plan
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Incentive for Trial Users */}
      {subscription.status === "trial" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Star className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Unlock Full Potential</h4>
                <p className="text-sm text-green-800 mb-3">
                  Upgrade to remove all limits and access premium features like unlimited searches, advanced analytics,
                  and priority support.
                </p>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  See Full Plan Benefits
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
