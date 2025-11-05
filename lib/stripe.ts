import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})

export const STRIPE_CONFIG = {
  carrier: {
    priceId: process.env.STRIPE_CARRIER_PRICE_ID!,
    trialDays: 7, // 7 days free trial
  },
  broker: {
    priceId: process.env.STRIPE_BROKER_PRICE_ID!,
    trialDays: 120, // 4 months (120 days) free trial
  },
  dispatcher: {
    priceId: process.env.STRIPE_DISPATCHER_PRICE_ID!,
    trialDays: 7, // 7 days free trial
  },
}