import { NextResponse } from "next/server"
import { getPublicPricingPlans, updatePricingPlan } from "@/lib/pricing-data"

export async function GET() {
  try {
    // Get the latest pricing data from the shared store
    const plans = getPublicPricingPlans()

    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error fetching pricing plans:", error)
    return NextResponse.json({ error: "Failed to fetch pricing plans" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { planId, updates } = await request.json()

    // Update the plan using the shared data store
    const updatedPlan = updatePricingPlan(planId, updates)

    if (!updatedPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    console.log(`Updated plan ${planId}:`, updatedPlan)

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
    })
  } catch (error) {
    console.error("Error updating pricing plan:", error)
    return NextResponse.json({ error: "Failed to update pricing plan" }, { status: 500 })
  }
}
