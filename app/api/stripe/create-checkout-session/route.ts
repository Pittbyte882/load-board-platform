import { NextResponse } from "next/server"
import { stripe, STRIPE_CONFIG } from "@/lib/stripe"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { userId, userType, userEmail, userName } = await request.json()

    console.log('📝 Creating checkout session for:', { userId, userType, userEmail })

    if (!userId || !userType || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get the correct price ID and trial days for user type
    const config = STRIPE_CONFIG[userType as keyof typeof STRIPE_CONFIG]
    
    console.log('💰 Config for user type:', config)

    if (!config) {
      return NextResponse.json(
        { error: "Invalid user type" },
        { status: 400 }
      )
    }

    if (!config.priceId) {
      console.error('❌ Missing price ID for user type:', userType)
      return NextResponse.json(
        { error: `Price ID not configured for ${userType}` },
        { status: 500 }
      )
    }

    // Check if user already has a Stripe customer ID
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('❌ Error fetching user:', userError)
    }

    let customerId = existingUser?.stripe_customer_id

    console.log('👤 Existing customer ID:', customerId)

    // Create or retrieve Stripe customer
    if (!customerId) {
      console.log('🆕 Creating new Stripe customer...')
      const customer = await stripe.customers.create({
        email: userEmail,
        name: userName,
        metadata: {
          userId: userId,
          userType: userType,
        },
      })
      customerId = customer.id
      console.log('✅ Created customer:', customerId)

      // Save customer ID to database
      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)

      if (updateError) {
        console.error('⚠️ Error saving customer ID:', updateError)
      }
    }

    console.log('🛒 Creating checkout session...')
    console.log('Price ID:', config.priceId)
    console.log('Trial days:', config.trialDays)

    // Create Checkout Session with trial
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: config.priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: config.trialDays,
        metadata: {
          userId: userId,
          userType: userType,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/login?trial_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup?type=${userType}&trial=true`,
      metadata: {
        userId: userId,
        userType: userType,
      },
    })

    console.log('✅ Checkout session created:', session.id)
    console.log('🔗 Checkout URL:', session.url)

    if (!session.url) {
      console.error('❌ No URL in session:', JSON.stringify(session, null, 2))
      return NextResponse.json(
        { error: "Checkout session created but no URL returned" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error: any) {
    console.error("❌ Error creating checkout session:", error)
    console.error("Error details:", error.message)
    console.error("Error stack:", error.stack)
    
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
