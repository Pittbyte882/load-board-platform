"use client"

import { UniversalMessages } from "@/components/shared/universal-messages"

export function BrokerMessages() {
  return (
    <UniversalMessages
      userRole="broker"
      filterOptions={["All", "Unread", "Carriers", "Dispatchers"]}
      subtitle="Communicate with carriers and dispatchers"
    />
  )
}