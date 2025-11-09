export async function calculateDistance(origin: string, destination: string): Promise<number> {
  try {
    const response = await fetch('/api/distance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ origin, destination }),
    })

    if (!response.ok) {
      throw new Error('Failed to calculate distance')
    }

    const data = await response.json()
    return data.distance
  } catch (error) {
    console.error('Error calculating distance:', error)
    // Fallback to a default distance
    return 500
  }
}