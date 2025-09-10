import type { Load } from './types'

// In-memory store for loads
let loads: Load[] = [
  {
    id: "LOAD-001",
    brokerId: "broker-1",
    brokerName: "John Smith",
    brokerCompany: "Smith Logistics",
    brokerMC: "MC-123456",
    title: "Electronics Shipment",
    pickupLocation: "Chicago, IL",
    deliveryLocation: "Atlanta, GA",
    pickupDate: "2024-01-15",
    deliveryDate: "2024-01-17",
    weight: 15000,
    rate: 1800,
    distance: 716,
    equipmentType: "24ft Box Truck",
    loadType: "FTL",
    description: "Electronics shipment requiring careful handling",
    status: "available",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
    postedDate: "2024-01-10",
    expedited: false,
    hazmat: false,
    teamDriver: false
  },
  {
    id: "LOAD-002",
    brokerId: "broker-1",
    brokerName: "John Smith",
    brokerCompany: "Smith Logistics",
    brokerMC: "MC-123456",
    title: "Electronics Shipment",
    pickupLocation: "Los Angeles, CA",
    deliveryLocation: "Phoenix, AZ",
    pickupDate: "2024-01-16",
    deliveryDate: "2024-01-17",
    weight: 8500,
    rate: 950,
    distance: 357,
    equipmentType: "Sprinter Van",
    loadType: "LTL",
    description: "Medical supplies - temperature sensitive",
    status: "claimed",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
    postedDate: "2024-01-11",
    claimedBy: "carrier-1",
    assignedCarrier: "Swift Transport",
    expedited: true,
    hazmat: false,
    teamDriver: false
  },
  {
    id: "LOAD-003",
    brokerId: "broker-1",
    brokerName: "John Smith",
    brokerCompany: "Smith Logistics",
    brokerMC: "MC-123456",
    title: "Electronics Shipment",
    pickupLocation: "Miami, FL",
    deliveryLocation: "Orlando, FL",
    pickupDate: "2024-01-14",
    deliveryDate: "2024-01-15",
    weight: 12000,
    rate: 650,
    distance: 235,
    equipmentType: "16ft Box Truck",
    loadType: "FTL",
    description: "Furniture delivery",
    status: "in-transit",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
    postedDate: "2024-01-09",
    claimedBy: "carrier-2",
    assignedCarrier: "Florida Freight",
    expedited: false,
    hazmat: false,
    teamDriver: false
  },
  {
    id: "LOAD-004",
    brokerId: "broker-1",
    brokerName: "John Smith",
    brokerCompany: "Smith Logistics",
    brokerMC: "MC-123456",
    title: "Electronics Shipment",
    pickupLocation: "New York, NY",
    deliveryLocation: "Boston, MA",
    pickupDate: "2024-01-12",
    deliveryDate: "2024-01-13",
    weight: 5500,
    rate: 850,
    distance: 215,
    equipmentType: "Cargo Van",
    loadType: "LTL",
    description: "Documents and small packages",
    status: "delivered",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z",
    postedDate: "2024-01-08",
    claimedBy: "carrier-3",
    assignedCarrier: "Express Delivery Co",
    expedited: false,
    hazmat: false,
    teamDriver: false
  }
]

export function getAllLoads(): Load[] {
  console.log(`Getting all loads from store: ${loads.length} loads`)
  return [...loads]
}

export function getLoadsByBrokerId(brokerId: string): Load[] {
  const brokerLoads = loads.filter(load => load.brokerId === brokerId)
  console.log(`Getting loads for broker ${brokerId}: ${brokerLoads.length} loads`)
  return brokerLoads
}

export function getAvailableLoads(): Load[] {
  const availableLoads = loads.filter(load => load.status === 'available')
  console.log(`Getting available loads: ${availableLoads.length} loads`)
  return availableLoads
}

export function getLoadById(id: string): Load | undefined {
  const load = loads.find(load => load.id === id)
  console.log(`Getting load by ID ${id}: ${load ? 'found' : 'not found'}`)
  return load
}

export function addLoad(loadData: Omit<Load, 'id' | 'postedDate'>): Load {
  const newLoad: Load = {
    ...loadData,
    id: `LOAD-${String(loads.length + 1).padStart(3, '0')}`,
    postedDate: new Date().toISOString().split('T')[0]
  }
  
  loads.unshift(newLoad) // Add to beginning of array
  console.log(`Load added to store: ${newLoad.id}. Total loads: ${loads.length}`)
  return newLoad
}

export function updateLoad(id: string, updates: Partial<Load>): Load | null {
  const index = loads.findIndex(load => load.id === id)
  if (index === -1) {
    console.log(`Load not found for update: ${id}`)
    return null
  }
  
  loads[index] = { ...loads[index], ...updates }
  console.log(`Load updated in store: ${id}`)
  return loads[index]
}

export function deleteLoad(id: string): boolean {
  const initialLength = loads.length
  loads = loads.filter(load => load.id !== id)
  const deleted = loads.length < initialLength
  console.log(`Load deletion attempt for ${id}: ${deleted ? 'success' : 'failed'}`)
  return deleted
}

export function claimLoad(loadId: string, claimedBy: string, assignedCarrier: string): Load | null {
  const load = loads.find(l => l.id === loadId)
  if (!load || load.status !== 'available') {
    console.log(`Cannot claim load ${loadId}: ${!load ? 'not found' : 'not available'}`)
    return null
  }
  
  load.status = 'claimed'
  load.claimedBy = claimedBy
  load.assignedCarrier = assignedCarrier
  
  console.log(`Load ${loadId} claimed by carrier ${claimedBy}`)
  return load
}
