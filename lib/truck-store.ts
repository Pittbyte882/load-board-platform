import { Truck } from '@/lib/types'

// Shared truck data store
class TruckStore {
  private trucks: Truck[] = [
    {
      id: "TRK-001",
      carrierId: "carrier-123",
      carrierName: "Mike Johnson",
      carrierCompany: "Johnson Transport",
      equipmentType: "26ft Box Truck",
      availableDate: "2024-01-20",
      city: "Chicago",
      state: "IL",
      postedDate: "2024-01-15T10:00:00Z",
      status: "available",
      capacity: 26000,
      specialEquipment: ["Liftgate", "GPS Tracking"],
      description: "26ft box truck, well maintained, perfect for local deliveries",
      dotNumber: "1234567",
      mcNumber: "MC-123456"
    }
  ]

  getAllTrucks(): Truck[] {
    return [...this.trucks]
  }

  getTrucksByCarrierId(carrierId: string): Truck[] {
    return this.trucks.filter(truck => truck.carrierId === carrierId)
  }

  getAvailableTrucks(): Truck[] {
    return this.trucks.filter(truck => truck.status === 'available')
  }

  getTruckById(id: string): Truck | undefined {
    return this.trucks.find(truck => truck.id === id)
  }

  addTruck(truckData: Partial<Truck>): Truck {
    const newTruck: Truck = {
      id: `TRK-${String(this.trucks.length + 1).padStart(3, '0')}`,
      carrierId: truckData.carrierId || '',
      carrierName: truckData.carrierName || '',
      carrierCompany: truckData.carrierCompany || '',
      equipmentType: truckData.equipmentType || '',
      availableDate: truckData.availableDate || '',
      city: truckData.city || '',
      state: truckData.state || '',
      postedDate: new Date().toISOString(),
      status: 'available',
      capacity: truckData.capacity,
      specialEquipment: truckData.specialEquipment,
      description: truckData.description,
      dotNumber: truckData.dotNumber,
      mcNumber: truckData.mcNumber
    }
    
    this.trucks.push(newTruck)
    console.log('Added truck to store:', newTruck)
    console.log('Total trucks in store:', this.trucks.length)
    return newTruck
  }

  updateTruck(id: string, updates: Partial<Truck>): Truck | null {
    const index = this.trucks.findIndex(truck => truck.id === id)
    if (index === -1) return null
    
    this.trucks[index] = { ...this.trucks[index], ...updates }
    return this.trucks[index]
  }

  deleteTruck(id: string): boolean {
    const index = this.trucks.findIndex(truck => truck.id === id)
    if (index === -1) return false
    
    this.trucks.splice(index, 1)
    return true
  }
}

// Export a singleton instance
export const truckStore = new TruckStore()
