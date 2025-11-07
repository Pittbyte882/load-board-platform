import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'

export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Checking for payment reminders...')

    const now = new Date()
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    threeDaysFromNow.setHours(23, 59, 59, 999) // End of day

    const threeDaysStart = new Date()
    threeDaysStart.setDate(threeDaysStart.getDate() + 3)
    threeDaysStart.setHours(0, 0, 0, 0) // Start of day

    // Get all active and trialing subscriptions where next billing is in 3 days
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        users!inner(id, email, first_name, last_name, role)
      `)
      .in('status', ['active', 'trialing'])
      .gte('current_period_end', threeDaysStart.toISOString())
      .lte('current_period_end', threeDaysFromNow.toISOString())

    if (error) throw error

    let remindersSent = 0

    for (const subscription of subscriptions || []) {
      // Check if reminder already sent
      const billingDate = new Date(subscription.current_period_end).toISOString().split('T')[0]
      const reminderKey = `payment_reminder_${subscription.id}_${billingDate}`
      
      const { data: existingReminder } = await supabase
        .from('email_logs')
        .select('id')
        .eq('reminder_key', reminderKey)
        .single()

      if (existingReminder) {
        console.log(`⏭️  Reminder already sent for subscription ${subscription.id}`)
        continue
      }

      // Get payment method from Stripe
      let cardInfo = { brand: 'Card', last4: '****' }
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
        const paymentMethod = await stripe.paymentMethods.retrieve(
          stripeSubscription.default_payment_method as string
        )
        cardInfo = {
          brand: paymentMethod.card?.brand || 'Card',
          last4: paymentMethod.card?.last4 || '****',
        }
      } catch (err) {
        console.error('Error fetching payment method:', err)
      }

      // Get pricing info
      const { data: pricingPlan } = await supabase
        .from('pricing_plans')
        .select('monthly_price')
        .eq('user_type', subscription.users.role)
        .single()

      const amount = pricingPlan?.monthly_price || 99
      const billingDateFormatted = new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

      // Send payment reminder email
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'payment-reminder',
          to: subscription.users.email,
          data: {
            userName: `${subscription.users.first_name} ${subscription.users.last_name}`,
            amount: amount,
            billingDate: billingDateFormatted,
            cardBrand: cardInfo.brand.charAt(0).toUpperCase() + cardInfo.brand.slice(1),
            last4: cardInfo.last4,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          },
        }),
      })

      // Log that we sent this reminder
      await supabase
        .from('email_logs')
        .insert([{
          user_id: subscription.users.id,
          email_type: 'payment-reminder',
          reminder_key: reminderKey,
          sent_at: new Date().toISOString(),
        }])

      remindersSent++
      console.log(`✅ Sent payment reminder to ${subscription.users.email} (billing ${billingDateFormatted})`)
    }

    console.log(`📧 Sent ${remindersSent} payment reminders`)

    return NextResponse.json({
      success: true,
      remindersSent: remindersSent,
    })
  } catch (error) {
    console.error('❌ Error checking payment reminders:', error)
    return NextResponse.json({ error: 'Failed to check payment reminders' }, { status: 500 })
  }
}