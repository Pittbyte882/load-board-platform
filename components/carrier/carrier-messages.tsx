"use client"

import { UniversalMessages } from "@/components/shared/universal-messages"

export function CarrierMessages() {
  return (
    <UniversalMessages
      userRole="carrier"
      filterOptions={["All", "Unread", "Brokers", "Dispatchers"]}
      subtitle="Communicate with brokers and dispatchers"
    />
  )
}