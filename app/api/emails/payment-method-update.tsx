import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components'
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
    <Html>
      <Head />
      <Preview>Payment method updated successfully</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment Method Updated 💳</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            Your payment method has been successfully updated to:
          </Text>

          <Text style={cardInfo}>
            {brand} ending in {last4}
          </Text>

          <Text style={text}>
            This card will be used for your next billing cycle.
          </Text>

          <Hr style={hr} />

          <Text style={text}>
            If you didn't make this change, please contact support immediately.
          </Text>

          <Text style={footer}>
            BOXALOO Billing Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default PaymentMethodUpdatedEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
}

const cardInfo = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  lineHeight: '26px',
  margin: '20px 0',
  padding: '20px 40px',
  backgroundColor: '#f3f4f6',
  borderRadius: '5px',
  textAlign: 'center' as const,
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 40px',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  padding: '0 40px',
  textAlign: 'center' as const,
}