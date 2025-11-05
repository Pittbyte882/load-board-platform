import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: plans, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .eq('status', 'active')
      .order('monthly_price', { ascending: true })

    if (error) throw error

    console.log('✅ Fetched pricing plans from Supabase:', plans?.length)

    // Format for frontend
    const formattedPlans = plans?.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthly_price,
      userType: plan.user_type,
      features: plan.features,
      trialFeatures: plan.trial_features,
      limitations: plan.limitations,
      trialDays: plan.trial_days,
      cta: plan.cta,
      isPopular: plan.is_popular,
      status: plan.status,
      subscribers: plan.subscribers,
      revenue: plan.revenue,
      trialUsers: plan.trial_users,
    }))

    return NextResponse.json(formattedPlans)
  } catch (error) {
    console.error("❌ Error fetching pricing plans:", error)
    return NextResponse.json({ error: "Failed to fetch pricing plans" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { planId, updates } = await request.json()

    console.log('📝 Updating pricing plan in Supabase:', planId)
    console.log('💰 New monthly price:', updates.monthlyPrice)

    const { data: updatedPlan, error } = await supabase
      .from('pricing_plans')
      .update({
        name: updates.name,
        description: updates.description,
        monthly_price: updates.monthlyPrice,
        features: updates.features,
        trial_features: updates.trialFeatures,
        limitations: updates.limitations,
        trial_days: updates.trialDays,
        cta: updates.cta,
        is_popular: updates.isPopular,
        status: updates.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId)
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase update error:', error)
      throw error
    }

    console.log('✅ Successfully updated in Supabase! New price:', updatedPlan.monthly_price)

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
    })
  } catch (error) {
    console.error("❌ Error updating pricing plan:", error)
    return NextResponse.json({ error: "Failed to update pricing plan" }, { status: 500 })
  }
}
