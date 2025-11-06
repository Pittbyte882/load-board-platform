import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const EMAIL_FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'BOXALOO'