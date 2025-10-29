import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

type PricingRouteContext = { params: Promise<{ id: string }> }

export async function PUT(
  request: NextRequest,
  { params }: PricingRouteContext
) {
  try {
    const { id } = await params
    const updatedPlanData = await request.json()

    const { data: plan, error } = await supabase
      .from('pricing_plans')
      .update({
        name: updatedPlanData.name,
        user_type: updatedPlanData.userType,
        monthly_price: updatedPlanData.monthlyPrice,
        trial_days: updatedPlanData.trialDays,
        features: updatedPlanData.features,
        trial_features: updatedPlanData.trialFeatures,
        cta: updatedPlanData.cta,
        description: updatedPlanData.description,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    console.log('✅ Pricing plan updated:', id)

    return NextResponse.json(plan)
  } catch (error) {
    console.error('❌ Error updating pricing plan:', error)
    return NextResponse.json(
      { error: "Failed to update pricing plan" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: PricingRouteContext
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('pricing_plans')
      .delete()
      .eq('id', id)

    if (error) throw error

    console.log('✅ Pricing plan deleted:', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Error deleting pricing plan:', error)
    return NextResponse.json(
      { error: "Failed to delete pricing plan" },
      { status: 500 }
    )
  }
}

