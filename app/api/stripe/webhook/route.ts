import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { supabase } from "@/lib/supabase"
import Stripe from "stripe"

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers() // FIX: await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed:`, err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  console.log(`🔔 Webhook received: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      default:
        console.log(`🤷‍♀️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('✅ Checkout completed:', session.id)

  const userId = session.metadata?.userId

  if (!userId) {
    console.error('❌ No userId in session metadata')
    return
  }

  // Get the subscription
  const subscriptionId = session.subscription as string
  if (!subscriptionId) {
    console.error('❌ No subscription in session')
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  // Save subscription to database
  await saveSubscription(userId, subscription)
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id)

  // Get userId from customer metadata
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  const userId = (customer as Stripe.Customer).metadata?.userId

  if (!userId) {
    console.error('❌ No userId in customer metadata')
    return
  }

  await saveSubscription(userId, subscription)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ Subscription deleted:', subscription.id)

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating canceled subscription:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Payment succeeded:', invoice.id)

  const subscriptionId = invoice.subscription as string
  
  if (subscriptionId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    const userId = (customer as Stripe.Customer).metadata?.userId

    if (userId) {
      await saveSubscription(userId, subscription)
    }
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('⚠️ Payment failed:', invoice.id)

  const subscriptionId = invoice.subscription as string
  
  if (subscriptionId) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating failed payment:', error)
    }
  }
}

async function saveSubscription(userId: string, subscription: Stripe.Subscription) {
  try {
    // Validate timestamps before conversion
    const currentPeriodStart = subscription.current_period_start
    const currentPeriodEnd = subscription.current_period_end
    const trialStart = subscription.trial_start
    const trialEnd = subscription.trial_end
    const canceledAt = subscription.canceled_at

    if (!currentPeriodStart || !currentPeriodEnd) {
      throw new Error('Missing required period timestamps')
    }

    const subscriptionData = {
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0].price.id,
      status: subscription.status,
      current_period_start: new Date(currentPeriodStart * 1000).toISOString(),
      current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
      trial_start: trialStart ? new Date(trialStart * 1000).toISOString() : null,
      trial_end: trialEnd ? new Date(trialEnd * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: canceledAt ? new Date(canceledAt * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }

    console.log('💾 Saving subscription:', subscriptionData.stripe_subscription_id)

    // Upsert (insert or update) subscription
    const { error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'stripe_subscription_id',
      })

    if (error) {
      console.error('❌ Error saving subscription:', error)
      throw error
    }

    console.log('✅ Subscription saved to database')
  } catch (error) {
    console.error('❌ Error in saveSubscription:', error)
    throw error
  }
}