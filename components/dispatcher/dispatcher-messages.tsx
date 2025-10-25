"use client"

import { UniversalMessages } from "@/components/shared/universal-messages"

export function DispatcherMessages() {
  return (
    <UniversalMessages
      userRole="dispatcher"
      filterOptions={["All", "Unread", "Brokers", "Carriers"]}
      subtitle="Communicate with brokers and carriers"
    />
  )
}