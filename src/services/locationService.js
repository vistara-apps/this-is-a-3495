// Location service for geocoding and location-based data
class LocationService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    this.cache = new Map()
    this.cacheTimeout = 60 * 60 * 1000 // 1 hour
  }

  // Geocode an address using Google Maps API
  async geocodeAddress(address) {
    if (!address || address.trim() === '') {
      throw new Error('Address is required')
    }

    // Check cache first
    const cacheKey = `geocode_${address.toLowerCase().trim()}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      // If no API key, return mock data for development
      if (!this.apiKey || this.apiKey === 'your-google-maps-api-key') {
        return this.getMockLocationData(address)
      }

      const encodedAddress = encodeURIComponent(address)
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${data.status}`)
      }

      if (!data.results || data.results.length === 0) {
        throw new Error('No results found for the given address')
      }

      const result = data.results[0]
      const locationData = this.parseGoogleMapsResult(result)

      // Cache the result
      this.cache.set(cacheKey, {
        data: locationData,
        timestamp: Date.now()
      })

      return locationData
    } catch (error) {
      console.error('Geocoding error:', error)
      // Fallback to mock data if API fails
      return this.getMockLocationData(address)
    }
  }

  // Parse Google Maps API result
  parseGoogleMapsResult(result) {
    const { geometry, formatted_address, address_components } = result
    
    // Extract location components
    const components = {}
    address_components.forEach(component => {
      const types = component.types
      if (types.includes('locality')) {
        components.city = component.long_name
      }
      if (types.includes('administrative_area_level_1')) {
        components.state = component.short_name
        components.stateLong = component.long_name
      }
      if (types.includes('country')) {
        components.country = component.short_name
        components.countryLong = component.long_name
      }
      if (types.includes('postal_code')) {
        components.zipCode = component.long_name
      }
    })

    return {
      address: formatted_address,
      coordinates: {
        lat: geometry.location.lat,
        lng: geometry.location.lng
      },
      components,
      climate: this.getClimateData(components.state, components.country),
      zoning: this.getZoningInfo(components.city, components.state),
      buildingCodes: this.getBuildingCodes(components.state, components.country),
      timezone: this.getTimezone(geometry.location.lat, geometry.location.lng)
    }
  }

  // Get mock location data for development/fallback
  getMockLocationData(address) {
    const mockLocations = {
      'new york': {
        address: 'New York, NY, USA',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        components: {
          city: 'New York',
          state: 'NY',
          stateLong: 'New York',
          country: 'US',
          countryLong: 'United States'
        },
        climate: 'humid_continental',
        zoning: 'mixed_use',
        buildingCodes: ['IBC', 'NYC Building Code'],
        timezone: 'America/New_York'
      },
      'los angeles': {
        address: 'Los Angeles, CA, USA',
        coordinates: { lat: 34.0522, lng: -118.2437 },
        components: {
          city: 'Los Angeles',
          state: 'CA',
          stateLong: 'California',
          country: 'US',
          countryLong: 'United States'
        },
        climate: 'mediterranean',
        zoning: 'mixed_use',
        buildingCodes: ['IBC', 'California Building Code'],
        timezone: 'America/Los_Angeles'
      },
      'chicago': {
        address: 'Chicago, IL, USA',
        coordinates: { lat: 41.8781, lng: -87.6298 },
        components: {
          city: 'Chicago',
          state: 'IL',
          stateLong: 'Illinois',
          country: 'US',
          countryLong: 'United States'
        },
        climate: 'humid_continental',
        zoning: 'mixed_use',
        buildingCodes: ['IBC', 'Chicago Building Code'],
        timezone: 'America/Chicago'
      }
    }

    const key = address.toLowerCase().trim()
    const match = Object.keys(mockLocations).find(city => key.includes(city))
    
    if (match) {
      return mockLocations[match]
    }

    // Default mock data
    return {
      address: address,
      coordinates: { lat: 40.7128, lng: -74.0060 },
      components: {
        city: 'Unknown',
        state: 'Unknown',
        country: 'US'
      },
      climate: 'temperate',
      zoning: 'commercial',
      buildingCodes: ['IBC'],
      timezone: 'America/New_York'
    }
  }

  // Get climate data based on location
  getClimateData(state, country) {
    const climateMap = {
      // US States
      'FL': 'tropical',
      'CA': 'mediterranean',
      'AZ': 'desert',
      'TX': 'subtropical',
      'NY': 'humid_continental',
      'IL': 'humid_continental',
      'WA': 'oceanic',
      'OR': 'oceanic',
      'CO': 'highland',
      'MT': 'continental',
      'AK': 'subarctic',
      'HI': 'tropical'
    }

    return climateMap[state] || 'temperate'
  }

  // Get zoning information
  getZoningInfo(city, state) {
    // This would typically come from local government APIs
    const majorCities = ['new york', 'los angeles', 'chicago', 'houston', 'phoenix']
    const cityLower = city?.toLowerCase() || ''
    
    if (majorCities.some(major => cityLower.includes(major))) {
      return 'mixed_use'
    }
    
    return 'commercial'
  }

  // Get applicable building codes
  getBuildingCodes(state, country) {
    const codes = ['IBC'] // International Building Code is standard
    
    // State-specific codes
    const stateCodes = {
      'CA': ['California Building Code', 'Title 24'],
      'NY': ['NYC Building Code'],
      'FL': ['Florida Building Code'],
      'TX': ['Texas Building Code'],
      'IL': ['Chicago Building Code']
    }
    
    if (stateCodes[state]) {
      codes.push(...stateCodes[state])
    }
    
    return codes
  }

  // Get timezone (simplified)
  getTimezone(lat, lng) {
    // This is a simplified mapping - in production, use a proper timezone API
    if (lng < -120) return 'America/Los_Angeles'
    if (lng < -105) return 'America/Denver'
    if (lng < -90) return 'America/Chicago'
    return 'America/New_York'
  }

  // Get location-specific design considerations
  getDesignConsiderations(locationData) {
    const considerations = []
    
    // Climate-based considerations
    switch (locationData.climate) {
      case 'tropical':
        considerations.push(
          'High humidity requires enhanced ventilation',
          'Hurricane-resistant design may be required',
          'Elevated foundations for flood protection',
          'UV-resistant materials recommended'
        )
        break
        
      case 'desert':
        considerations.push(
          'Extreme temperature variations require thermal mass',
          'Water conservation systems essential',
          'Dust protection for HVAC systems',
          'Solar heat gain mitigation'
        )
        break
        
      case 'humid_continental':
        considerations.push(
          'Freeze-thaw cycle affects foundation design',
          'Snow load calculations required',
          'Moisture control and vapor barriers essential',
          'Energy-efficient heating systems'
        )
        break
        
      case 'mediterranean':
        considerations.push(
          'Earthquake considerations may apply',
          'Fire-resistant materials in wildfire zones',
          'Natural ventilation opportunities',
          'Drought-resistant landscaping'
        )
        break
        
      default:
        considerations.push(
          'Standard climate considerations apply',
          'Energy efficiency optimization recommended'
        )
    }
    
    // Building code considerations
    if (locationData.buildingCodes.includes('California Building Code')) {
      considerations.push('Seismic design requirements apply')
    }
    
    if (locationData.buildingCodes.includes('Florida Building Code')) {
      considerations.push('High wind load design required')
    }
    
    return considerations
  }

  // Validate address format
  validateAddress(address) {
    if (!address || typeof address !== 'string') {
      return { valid: false, message: 'Address is required' }
    }
    
    const trimmed = address.trim()
    if (trimmed.length < 3) {
      return { valid: false, message: 'Address is too short' }
    }
    
    if (trimmed.length > 200) {
      return { valid: false, message: 'Address is too long' }
    }
    
    return { valid: true }
  }

  // Get nearby architectural landmarks or references
  async getNearbyLandmarks(coordinates, radius = 5000) {
    // This would typically use Google Places API
    // For now, return mock data
    return [
      {
        name: 'Notable Building',
        type: 'architecture',
        distance: 1200,
        style: 'modern'
      }
    ]
  }

  // Clear cache
  clearCache() {
    this.cache.clear()
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }
}

export const locationService = new LocationService()
export default locationService
