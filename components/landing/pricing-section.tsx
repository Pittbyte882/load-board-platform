"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Star, Clock, Gift } from "lucide-react"

interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  userType: "carrier" | "broker" | "dispatcher"
  features: string[]
  limitations: string[]
  isPopular?: boolean
  cta: string
  trialDays: number
  trialFeatures: string[]
}

export function PricingSection() {
  const router = useRouter()
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchPricingPlans()

    // Listen for pricing updates from admin dashboard
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pricing-updated") {
        console.log("Pricing updated, refetching...")
        fetchPricingPlans()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Also listen for custom events from the same tab
    const handlePricingUpdate = () => {
      console.log("Pricing updated in same tab, refetching...")
      fetchPricingPlans()
    }

    window.addEventListener("pricing-updated", handlePricingUpdate)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("pricing-updated", handlePricingUpdate)
    }
  }, [])

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch("/api/pricing", {
        cache: "no-store", // Ensure we get fresh data
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      if (response.ok) {
        const data = await response.json()
        setPricingPlans(data)
        console.log("Fetched pricing plans:", data)
      }
    } catch (error) {
      console.error("Error fetching pricing plans:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetStarted = (userType: "carrier" | "broker" | "dispatcher") => {
    router.push(`/signup?type=${userType}&trial=true`)
  }

  const getPlanByUserType = (userType: "carrier" | "broker" | "dispatcher") => {
    return pricingPlans.find((plan) => plan.userType === userType)
  }

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Per-User Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your business. All plans include free trials to get you started.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Monthly Pricing</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your business. All plans include free trials to get you started.
          </p>
        </div>

        <Tabs defaultValue="carriers" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="carriers" className="text-sm font-medium">
              For Carriers
            </TabsTrigger>
            <TabsTrigger value="brokers" className="text-sm font-medium">
              For Brokers
            </TabsTrigger>
            <TabsTrigger value="dispatchers" className="text-sm font-medium">
              For Dispatchers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="carriers" className="space-y-8">
            {(() => {
              const plan = getPlanByUserType("carrier")
              if (!plan) return null

              return (
                <div className="flex justify-center">
                  <Card className="w-full max-w-lg border-2 border-green-500 shadow-xl relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-600 text-white px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>

                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-lg">{plan.description}</CardDescription>

                      {/* Trial Badge */}
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
                      {/* Trial Features */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Clock className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-900">Free Trial Includes:</span>
                        </div>
                        <div className="space-y-2">
                          {plan.trialFeatures.map((feature, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-blue-800">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Full Plan Features */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Full Plan Features:</h4>
                        <div className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleGetStarted("carrier")}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                      >
                        {plan.cta}
                      </Button>

                      <p className="text-xs text-gray-500 text-center mt-3">
                        No credit card required • Cancel anytime during trial
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )
            })()}
          </TabsContent>

          <TabsContent value="brokers" className="space-y-8">
            {(() => {
              const plan = getPlanByUserType("broker")
              if (!plan) return null

              return (
                <div className="flex justify-center">
                  <Card className="w-full max-w-lg border-2 border-blue-500 shadow-xl relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Professional Choice
                      </Badge>
                    </div>

                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-lg">{plan.description}</CardDescription>

                      {/* Trial Badge */}
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
                      {/* Trial Features */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Clock className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-900">Free Trial Includes:</span>
                        </div>
                        <div className="space-y-2">
                          {plan.trialFeatures.map((feature, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-blue-800">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Full Plan Features */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Full Plan Features:</h4>
                        <div className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleGetStarted("broker")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                      >
                        {plan.cta}
                      </Button>

                      <p className="text-xs text-gray-500 text-center mt-3">
                        No credit card required • Cancel anytime during trial
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )
            })()}
          </TabsContent>

          <TabsContent value="dispatchers" className="space-y-8">
            {(() => {
              const plan = getPlanByUserType("dispatcher")
              if (!plan) return null

              return (
                <div className="flex justify-center">
                  <Card className="w-full max-w-lg border-2 border-purple-500 shadow-xl relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Fleet Favorite
                      </Badge>
                    </div>

                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-lg">{plan.description}</CardDescription>

                      {/* Trial Badge */}
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
                      {/* Trial Features */}
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Clock className="h-4 w-4 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-900">Free Trial Includes:</span>
                        </div>
                        <div className="space-y-2">
                          {plan.trialFeatures.map((feature, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-blue-800">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Full Plan Features */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Full Plan Features:</h4>
                        <div className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleGetStarted("dispatcher")}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
                      >
                        {plan.cta}
                      </Button>

                      <p className="text-xs text-gray-500 text-center mt-3">
                        No credit card required • Cancel anytime during trial
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )
            })()}
          </TabsContent>
        </Tabs>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">How do free trials work?</h4>
              <p className="text-gray-600 text-sm">
                Start your free trial immediately after signup. No credit card required. Access limited features during
                trial, then upgrade to unlock full functionality.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel during the trial?</h4>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel anytime during your trial period with no charges. Your account will remain active
                until the trial ends.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What happens after the trial?</h4>
              <p className="text-gray-600 text-sm">
                You'll be prompted to add payment information to continue with full access. If you don't upgrade, your
                account will be downgraded to limited access.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a setup fee?</h4>
              <p className="text-gray-600 text-sm">
                No setup fees or hidden costs. Just simple monthly pricing per user with everything included.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
