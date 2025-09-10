// Shared pricing data store
// In a real application, this would be replaced with database operations

export interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  userType: "carrier" | "broker" | "dispatcher"
  features: string[]
  limitations: string[]
  subscribers?: number
  revenue?: number
  status?: "active" | "inactive"
  isPopular?: boolean
  cta: string
  trialDays: number
  trialFeatures: string[]
  trialUsers?: number
}

const pricingPlans: PricingPlan[] = [
  // Single Carrier Plan
  {
    id: "carrier-plan",
    name: "Carrier Plan",
    description: "Complete solution for carriers and fleets",
    monthlyPrice: 99,
    userType: "carrier",
    features: [
      "Unlimited load searches",
      "Advanced search filters",
      "Priority load notifications",
      "Route optimization tools",
      "Load history & analytics",
      "Priority customer support",
      "Payment protection",
      "Credit line access",
      "Fuel card integration",
      "Fleet management dashboard",
      "Mobile app access",
      "24/7 phone support",
    ],
    limitations: [],
    subscribers: 4294,
    revenue: 425106,
    status: "active",
    isPopular: true,
    cta: "Start Free Trial",
    trialDays: 14,
    trialFeatures: [
      "Up to 50 load searches",
      "Basic search filters",
      "Email notifications",
      "Mobile app access",
      "Standard customer support",
    ],
    trialUsers: 1247,
  },
  // Single Broker Plan
  {
    id: "broker-plan",
    name: "Broker Plan",
    description: "Complete solution for brokers and 3PLs",
    monthlyPrice: 149,
    userType: "broker",
    features: [
      "Unlimited load postings",
      "Advanced carrier matching",
      "Priority load placement",
      "Extended posting duration (30 days)",
      "Carrier verification tools",
      "Advanced analytics & reporting",
      "Priority customer support",
      "Credit checks on carriers",
      "Automated load reposting",
      "Custom load templates",
      "Multi-user accounts",
      "Custom integrations & API",
      "White-label solutions",
      "24/7 phone support",
    ],
    limitations: [],
    subscribers: 1866,
    revenue: 493834,
    status: "active",
    isPopular: true,
    cta: "Start Free Trial",
    trialDays: 7,
    trialFeatures: [
      "Up to 10 load postings",
      "Basic carrier search",
      "Email notifications",
      "Standard posting duration (7 days)",
      "Basic analytics",
      "Email support",
    ],
    trialUsers: 892,
  },
  // Single Dispatcher Plan
  {
    id: "dispatcher-plan",
    name: "Dispatcher Plan",
    description: "Complete solution for dispatchers and fleet managers",
    monthlyPrice: 79,
    userType: "dispatcher",
    features: [
      "Unlimited driver management",
      "Multi-client management",
      "Advanced route optimization",
      "Driver performance analytics",
      "Automated dispatch notifications",
      "Load assignment tools",
      "Priority customer support",
      "Client reporting dashboard",
      "Fuel optimization tools",
      "Multi-location support",
      "Advanced analytics suite",
      "Custom integrations",
      "API access",
      "24/7 phone support",
    ],
    limitations: [],
    subscribers: 879,
    revenue: 69441,
    status: "active",
    isPopular: true,
    cta: "Start Free Trial",
    trialDays: 10,
    trialFeatures: [
      "Manage up to 5 drivers",
      "Load search & booking",
      "Driver communication tools",
      "Basic route planning",
      "Load tracking",
      "Email notifications",
    ],
    trialUsers: 456,
  },
]

// Get all pricing plans
export function getAllPricingPlans(): PricingPlan[] {
  return [...pricingPlans]
}

// Get public pricing plans (without admin fields)
export function getPublicPricingPlans() {
  return pricingPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    monthlyPrice: plan.monthlyPrice,
    userType: plan.userType,
    features: plan.features,
    limitations: plan.limitations,
    isPopular: plan.isPopular,
    cta: plan.cta,
    trialDays: plan.trialDays,
    trialFeatures: plan.trialFeatures,
  }))
}

// Get a single pricing plan
export function getPricingPlan(id: string): PricingPlan | undefined {
  return pricingPlans.find((plan) => plan.id === id)
}

// Update a pricing plan
export function updatePricingPlan(id: string, updatedPlan: Partial<PricingPlan>): PricingPlan | null {
  const planIndex = pricingPlans.findIndex((plan) => plan.id === id)

  if (planIndex === -1) {
    return null
  }

  pricingPlans[planIndex] = {
    ...pricingPlans[planIndex],
    ...updatedPlan,
    id, // Ensure ID doesn't change
  }

  return pricingPlans[planIndex]
}

// Delete a pricing plan
export function deletePricingPlan(id: string): boolean {
  const planIndex = pricingPlans.findIndex((plan) => plan.id === id)

  if (planIndex === -1) {
    return false
  }

  pricingPlans.splice(planIndex, 1)
  return true
}

// Add a new pricing plan
export function addPricingPlan(plan: PricingPlan): PricingPlan {
  pricingPlans.push(plan)
  return plan
}
