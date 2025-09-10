import { NextRequest, NextResponse } from "next/server"
import { getPricingPlan, updatePricingPlan, deletePricingPlan } from "@/lib/pricing-data"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updatedPlanData = await request.json()

    const updated = await updatePricingPlan(id, updatedPlanData)

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update pricing plan" },
      { status: 500 }
    )
  }
}


