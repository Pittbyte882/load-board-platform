import * as React from 'react'

interface PaymentMethodUpdatedEmailProps {
  userName: string
  last4: string
  brand: string
}

export const PaymentMethodUpdatedEmail = ({
  userName = 'User',
  last4 = '4242',
  brand = 'Visa',
}: PaymentMethodUpdatedEmailProps) => {
  return (
    <div>
      <h1>Payment Method Updated</h1>
      <p>Hi {userName},</p>
      <p>Your payment method has been successfully updated to:</p>
      <p><strong>{brand} ending in {last4}</strong></p>
    </div>
  )
}

export default PaymentMethodUpdatedEmail