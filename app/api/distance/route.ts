import { NextResponse } from 'next/server'

// Fallback estimation function
function estimateDistance(origin: string, destination: string): number {
  const cityCoords: { [key: string]: { lat: number; lng: number } } = {
    'chicago,il': { lat: 41.8781, lng: -87.6298 },
    'atlanta,ga': { lat: 33.7490, lng: -84.3880 },
    'losangeles,ca': { lat: 34.0522, lng: -118.2437 },
    'newyork,ny': { lat: 40.7128, lng: -74.0060 },
    'miami,fl': { lat: 25.7617, lng: -80.1918 },
    'dallas,tx': { lat: 32.7767, lng: -96.7970 },
    'phoenix,az': { lat: 33.4484, lng: -112.0740 },
    'houston,tx': { lat: 29.7604, lng: -95.3698 },
    'philadelphia,pa': { lat: 39.9526, lng: -75.1652 },
    'sanantonio,tx': { lat: 29.4241, lng: -98.4936 },
    'sandiego,ca': { lat: 32.7157, lng: -117.1611 },
    'denver,co': { lat: 39.7392, lng: -104.9903 },
    'lasvegas,nv': { lat: 36.1699, lng: -115.1398 },
    'portland,or': { lat: 45.5051, lng: -122.6750 },
    'seattle,wa': { lat: 47.6062, lng: -122.3321 },
  }

  const originKey = origin.toLowerCase().replace(/\s+/g, '').replace(/,/g, ',')
  const destKey = destination.toLowerCase().replace(/\s+/g, '').replace(/,/g, ',')

  const originCoords = cityCoords[originKey]
  const destCoords = cityCoords[destKey]

  if (originCoords && destCoords) {
    return haversineDistance(
      originCoords.lat,
      originCoords.lng,
      destCoords.lat,
      destCoords.lng
    )
  }

  // Default fallback
  return 500
}

// Haversine formula for distance between coordinates
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8 // Radius of Earth in miles
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export async function POST(request: Request) {
    console.log('🔑 API Key present:', !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  
  // Declare origin and destination at the top of the function scope
  let origin = ''
  let destination = ''

  try {
    const body = await request.json()
    origin = body.origin
    destination = body.destination

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error('Google Maps API key not found')
      return NextResponse.json(
        { distance: estimateDistance(origin, destination) },
        { status: 200 }
      )
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&units=imperial&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
      const distanceInMeters = data.rows[0].elements[0].distance.value
      const distanceInMiles = Math.round(distanceInMeters * 0.000621371)
      
      return NextResponse.json({ distance: distanceInMiles })
    }

    console.warn('Google Maps API error:', data.status)
    return NextResponse.json(
      { distance: estimateDistance(origin, destination) },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error calculating distance:', error)
    
    // If we have origin and destination, use fallback estimation
    if (origin && destination) {
      return NextResponse.json(
        { distance: estimateDistance(origin, destination) },
        { status: 200 }
      )
    }
    
    // Otherwise return a default distance
    return NextResponse.json(
      { distance: 500 },
      { status: 200 }
    )
  }
}