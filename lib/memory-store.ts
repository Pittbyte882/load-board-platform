// Simple in-memory storage for development (until database is connected)
let loads: any[] = []
let trucks: any[] = []
let carriers: any[] = []

export const memoryStore = {
  // Loads
  addLoad: (load: any) => {
    loads.push(load)
    console.log('Memory Store: Load added', load.id, 'Total loads:', loads.length)
    return load
  },
  
  getAllLoads: () => {
    console.log('Memory Store: Getting all loads, count:', loads.length)
    return loads
  },
  
  getLoadsByBrokerId: (brokerId: string) => {
    const filtered = loads.filter(load => load.brokerId === brokerId)
    console.log(`Memory Store: Getting loads for broker ${brokerId}, found:`, filtered.length)
    return filtered
  },
  
  getAvailableLoads: () => {
    const available = loads.filter(load => load.status === 'available')
    console.log('Memory Store: Getting available loads, found:', available.length)
    return available
  },
  
  updateLoad: (id: string, updates: any) => {
    const index = loads.findIndex(load => load.id === id)
    if (index !== -1) {
      loads[index] = { ...loads[index], ...updates }
      console.log('Memory Store: Load updated', id)
      return loads[index]
    }
    console.log('Memory Store: Load not found for update', id)
    return null
  },
  
  deleteLoad: (id: string) => {
    const before = loads.length
    loads = loads.filter(load => load.id !== id)
    console.log(`Memory Store: Load deleted ${id}, before: ${before}, after: ${loads.length}`)
  },
  
  // Trucks
  addTruck: (truck: any) => {
    trucks.push(truck)
    return truck
  },
  
  getMyTrucks: (carrierId: string) => {
    return trucks.filter(truck => truck.carrierId === carrierId)
  },
  
  getAvailableTrucks: () => {
    return trucks.filter(truck => truck.status === 'available')
  },
  
  deleteTruck: (id: string) => {
    trucks = trucks.filter(truck => truck.id !== id)
  },
  
  // Carriers
  addCarrier: (carrier: any) => {
    carriers.push(carrier)
    return carrier
  },
  
  getAllCarriers: () => carriers,
  
  updateCarrier: (id: string, data: any) => {
    const index = carriers.findIndex(c => c.id === id)
    if (index !== -1) {
      carriers[index] = { ...carriers[index], ...data }
      return carriers[index]
    }
    return null
  },
  
  deleteCarrier: (id: string) => {
    carriers = carriers.filter(c => c.id !== id)
  }
}