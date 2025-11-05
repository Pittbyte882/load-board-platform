"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, Clock, Gift, Loader2 } from "lucide-react"
import { loadStripe } from '@stripe/stripe-js'
import { useAuth } from "@/lib/auth-context"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface SubscriptionCardProps {
  userType: "carrier" | "broker" | "dispatcher"
  userId?: string
}

export function SubscriptionCard({ userType, userId }: SubscriptionCardProps) {
  const { user } = useAuth()
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)

  const fetchPlan = async () => {
    try {
      console.log('🔍 Fetching pricing for userType:', userType)
      
      const response = await fetch("/api/pricing", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const plans = await response.json()
        const userPlan = plans.find((p: any) => p.userType === userType)
        setPlan(userPlan)
      }
    } catch (error) {
      console.error("❌ Error fetching plan:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscription = async () => {
    if (!userId) return
    
    try {
      const response = await fetch(`/api/stripe/subscription?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
    }
  }

  useEffect(() => {
    fetchPlan()
    fetchSubscription()

    // Listen for pricing updates from admin
    const handlePricingUpdate = () => {
      console.log('🔄 Pricing updated, refreshing...')
      fetchPlan()
    }

    window.addEventListener('pricing-updated', handlePricingUpdate)

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pricing-updated') {
        fetchPlan()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('pricing-updated', handlePricingUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [userType, userId])

  const handleStartTrial = async () => {
    if (!user) {
      alert("Please log in to start your free trial")
      return
    }

    setCheckoutLoading(true)

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userType: userType,
          userEmail: user.email,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        }),
      })

      const { sessionId, url } = await response.json()

      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Error starting trial:', error)
      alert('Failed to start trial. Please try again.')
      setCheckoutLoading(false)
    }
  }

  const getBorderColor = () => {
    switch (userType) {
      case "carrier": return "border-green-500"
      case "broker": return "border-blue-500"
      case "dispatcher": return "border-purple-500"
      default: return "border-gray-500"
    }
  }

  const getBadgeColor = () => {
    switch (userType) {
      case "carrier": return "bg-green-600"
      case "broker": return "bg-blue-600"
      case "dispatcher": return "bg-purple-600"
      default: return "bg-gray-600"
    }
  }

  const getButtonColor = () => {
    switch (userType) {
      case "carrier": return "bg-green-600 hover:bg-green-700"
      case "broker": return "bg-blue-600 hover:bg-blue-700"
      case "dispatcher": return "bg-purple-600 hover:bg-purple-700"
      default: return "bg-gray-600 hover:bg-gray-700"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No subscription plan available</p>
      </div>
    )
  }

  // If user has active subscription, show different UI
  if (subscription && (subscription.status === 'active' || subscription.status === 'trialing')) {
    return (
      <div className="flex justify-center py-8">
        <Card className={`w-full max-w-lg border-2 ${getBorderColor()} shadow-xl`}>
          <CardHeader className="text-center">
            <Badge className="mx-auto mb-4 bg-green-600 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              {subscription.status === 'trialing' ? 'Free Trial Active' : 'Subscribed'}
            </Badge>
            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
            {subscription.status === 'trialing' && subscription.trial_end && (
              <p className="text-sm text-gray-600 mt-2">
                Trial ends: {new Date(subscription.trial_end).toLocaleDateString()}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/dashboard#settings'}>
              Manage Subscription
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center py-8">
      <Card className={`w-full max-w-lg border-2 ${getBorderColor()} shadow-xl relative`}>
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge className={`${getBadgeColor()} text-white px-4 py-1`}>
            <Star className="h-3 w-3 mr-1" />
            Boxaloo
          </Badge>
        </div>

        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
          <CardDescription className="text-lg">{plan.description}</CardDescription>

          <div className="flex items-center justify-center mt-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
              <Gift className="h-3 w-3 mr-1" />
              {plan.trialDays}-Day Free Trial
            </Badge>
          </div>

          <div className="mt-6">
            <div className="flex items-baseline justify-center">
              <span className="text-5xl font-bold text-gray-900">${plan.monthlyPrice}</span>
              <span className="text-gray-500 ml-2">/month</span>
              <span className="text-sm text-gray-500 ml-1">per user</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Free Trial Includes:</span>
            </div>
            <div className="space-y-2">
              {plan.trialFeatures.map((feature: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Full Plan Features:</h4>
            <div className="space-y-3">
              {plan.features.map((feature: string, index: number) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <Button 
            className={`w-full ${getButtonColor()} text-white py-3 text-lg font-semibold`} 
            onClick={handleStartTrial}
            disabled={checkoutLoading}
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              plan.cta
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Credit card required • Cancel anytime during trial
          </p>
        </CardContent>
      </Card>
    </div>
  )
}