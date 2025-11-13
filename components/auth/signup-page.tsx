"use client"

import type React from "react"
import { showToastWithLogo } from '@/components/ui/custom-toasts'
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, Truck, Users, Gift, Clock, Loader2 } from "lucide-react"

export function SignupPage() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    role: "",
    phone: "",
    agreeToTerms: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isTrialSignup, setIsTrialSignup] = useState(false)
  const [trialInfo, setTrialInfo] = useState<{
    days: number
    features: string[]
    price: number
  } | null>(null)

  // Pre-select role based on URL parameter and detect trial signup
  useEffect(() => {
    const typeParam = searchParams.get("type")
    const trialParam = searchParams.get("trial")

    if (typeParam && ["carrier", "broker", "dispatcher"].includes(typeParam)) {
      setFormData((prev) => ({
        ...prev,
        role: typeParam,
      }))
    }

    if (trialParam === "true") {
      setIsTrialSignup(true)
      // Fetch real pricing data
      fetchTrialInfo(typeParam as string)
    }
  }, [searchParams])

  const fetchTrialInfo = async (userType: string) => {
    try {
      const response = await fetch("/api/pricing")
      if (response.ok) {
        const plans = await response.json()
        const plan = plans.find((p: any) => p.userType === userType)
        if (plan) {
          setTrialInfo({
            days: plan.trialDays,
            features: plan.trialFeatures,
            price: plan.monthlyPrice,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching trial info:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        showToastWithLogo({
        title: "Password Error",
        message: "Passwords don't match! Please try again.",
        type: 'error'
      })
      setIsLoading(false)
      return
    }


      // Step 1: Create user account
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          role: formData.role,
          phone: formData.phone
        })
      })

      if (!signupResponse.ok) {
          const error = await signupResponse.json()
          showToastWithLogo({
            title: "Signup Failed",
            message: error.error || "Please check your information and try again.",
            type: 'error'
          })
          setIsLoading(false)
          return
        }

      const userData = await signupResponse.json()

      // Step 2: If trial signup, create Stripe checkout session
      if (isTrialSignup) {
        const checkoutResponse = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userData.user.id,
            userType: formData.role,
            userEmail: formData.email,
            userName: `${formData.firstName} ${formData.lastName}`.trim(),
          }),
        })

        const { url } = await checkoutResponse.json()

        if (url) {
          // Redirect to Stripe Checkout
          window.location.href = url
        } else {
          throw new Error('No checkout URL returned')
        }
      } else {
        // Regular signup without trial
        showToastWithLogo({
      title: "Account Created Successfully!",
      message: "Welcome to Boxaloo! Check your email for confirmation.",
      type: 'success'
    })
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Signup error:', error)
       showToastWithLogo({
      title: "Signup Failed",
      message: "Please check your information and try again.",
      type: 'error'
    })
  } finally {
    setIsLoading(false)
  }
}

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "broker":
        return <Building2 className="h-4 w-4" />
      case "carrier":
        return <Truck className="h-4 w-4" />
      case "dispatcher":
        return <Users className="h-4 w-4" />
      default:
        return null
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "broker":
        return "Freight Broker"
      case "carrier":
        return "Box Truck/Cargo Van Carrier"
      case "dispatcher":
        return "Dispatcher"
      default:
        return "Select your role"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center space-x-2 mb-6 text-gray-600 hover:text-green-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to home</span>
        </Link>

        <div className="flex items-center justify-center mb-6">
          <Image src="/images/boxaloo-logo.png" alt="BOXALOO" width={150} height={50} className="h-12 w-auto" />
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isTrialSignup ? "Start Your Free Trial" : "Create your account"}
            </CardTitle>
            <CardDescription className="text-center">
              {isTrialSignup
                ? `${trialInfo?.days || 0}-day free trial, then $${trialInfo?.price || 0}/month`
                : "Join thousands of brokers and carriers"}
            </CardDescription>

            {/* Trial Badge */}
            {isTrialSignup && trialInfo && (
              <div className="flex items-center justify-center mt-4">
                <Badge className="bg-green-100 text-green-800 px-4 py-2">
                  <Gift className="h-4 w-4 mr-2" />
                  {trialInfo.days}-Day Free Trial
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {/* Trial Features Preview */}
            {isTrialSignup && trialInfo && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-3">
                  <Clock className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Your trial includes:</span>
                </div>
                <ul className="space-y-1">
                  {trialInfo.features.map((feature, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-blue-600 mt-3 font-medium">
                  Credit card required • No charge until trial ends • Cancel anytime
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              {/* Password Fields */}
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                />
              </div>

              {/* Company Name */}
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  required
                />
              </div>

              {/* Role Selection */}
              <div>
                <Label htmlFor="role">I am a...</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="broker">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4" />
                        <span>Freight Broker</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="carrier">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4" />
                        <span>Box Truck/Cargo Van Carrier</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dispatcher">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Dispatcher</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                />
              </div>

              {/* Terms Agreement */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                />
                <Label htmlFor="agreeToTerms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-green-600 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-green-600 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isLoading || !formData.agreeToTerms}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : isTrialSignup ? (
                  `Start ${trialInfo?.days}-Day Free Trial`
                ) : (
                  "Create Account"
                )}
              </Button>

              {/* Trial Disclaimer */}
              {isTrialSignup && trialInfo && (
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    After signup, you'll add payment details. Trial starts immediately. First charge: ${trialInfo.price} on day {trialInfo.days + 1}.
                  </p>
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-green-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}