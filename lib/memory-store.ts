// Simple in-memory storage for development (until database is connected)
let loads: any[] = []
let trucks: any[] = []
let carriers: any[] = []

export const memoryStore = {
  // Loads
  addLoad: (load: any) => {
    loads.push(load)
    return load
  },
  
  getAllLoads: () => loads,
  
  getLoadsByBrokerId: (brokerId: string) => {
    return loads.filter(load => load.brokerId === brokerId)
  },
  
  getAvailableLoads: () => {
    return loads.filter(load => load.status === 'available')
  },
  
  updateLoad: (id: string, updates: any) => {
    const index = loads.findIndex(load => load.id === id)
    if (index !== -1) {
      loads[index] = { ...loads[index], ...updates }
      return loads[index]
    }
    return null
  },
  
  deleteLoad: (id: string) => {
    loads = loads.filter(load => load.id !== id)
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