"use client"

import { LandingNav } from "@/components/landing/landing-nav"
import { PricingSection } from "@/components/landing/pricing-section"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <PricingSection />
      <LandingFooter />
    </div>
  )
}
