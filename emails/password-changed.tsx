import * as React from 'react'

interface PasswordChangedEmailProps {
  userName: string
  changeTime: string
}

export const PasswordChangedEmail = ({
  userName = 'User',
  changeTime = new Date().toLocaleString(),
}: PasswordChangedEmailProps) => {
  return (
    <div>
      <h1>Password Changed</h1>
      <p>Hi {userName},</p>
      <p>Your BOXALOO account password was successfully changed on {changeTime}.</p>
      <p>If you did NOT make this change, please contact support immediately.</p>
    </div>
  )
}

export default PasswordChangedEmail