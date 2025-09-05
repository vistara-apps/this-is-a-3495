// Subscription service for managing user tiers and limitations
import { v4 as uuidv4 } from 'uuid'

export const SUBSCRIPTION_TIERS = {
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: {
      maxProjects: 5,
      maxLayoutsPerProject: 5,
      maxSpaceTypes: 10,
      exportFormats: ['PNG', 'SVG'],
      support: 'Standard',
      apiAccess: false,
      customSpaceTypes: false
    },
    limits: {
      projectsPerMonth: 5,
      layoutGenerationsPerDay: 10,
      layoutGenerationsPerMonth: 100,
      apiRequestsPerHour: 100
    }
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 79,
    currency: 'USD',
    interval: 'month',
    features: {
      maxProjects: 25,
      maxLayoutsPerProject: 15,
      maxSpaceTypes: 50,
      exportFormats: ['PNG', 'SVG', 'DXF', 'PDF'],
      support: 'Priority',
      apiAccess: true,
      customSpaceTypes: true
    },
    limits: {
      projectsPerMonth: 25,
      layoutGenerationsPerDay: 50,
      layoutGenerationsPerMonth: 500,
      apiRequestsPerHour: 1000
    }
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    currency: 'USD',
    interval: 'month',
    features: {
      maxProjects: -1, // Unlimited
      maxLayoutsPerProject: -1, // Unlimited
      maxSpaceTypes: -1, // Unlimited
      exportFormats: ['PNG', 'SVG', 'DXF', 'PDF', 'DWG', 'IFC'],
      support: 'Dedicated',
      apiAccess: true,
      customSpaceTypes: true,
      whiteLabel: true,
      sso: true
    },
    limits: {
      projectsPerMonth: -1, // Unlimited
      layoutGenerationsPerDay: -1, // Unlimited
      layoutGenerationsPerMonth: -1, // Unlimited
      apiRequestsPerHour: -1 // Unlimited
    }
  }
}

class SubscriptionService {
  constructor() {
    this.usageCache = new Map()
  }

  // Get subscription tier details
  getTierDetails(tierId) {
    return SUBSCRIPTION_TIERS[tierId.toUpperCase()] || SUBSCRIPTION_TIERS.BASIC
  }

  // Check if user can perform an action based on their subscription
  canPerformAction(user, action, currentUsage = {}) {
    const tier = this.getTierDetails(user.subscriptionTier)
    
    switch (action) {
      case 'CREATE_PROJECT':
        if (tier.features.maxProjects === -1) return { allowed: true }
        return {
          allowed: (currentUsage.projectCount || 0) < tier.features.maxProjects,
          limit: tier.features.maxProjects,
          current: currentUsage.projectCount || 0,
          message: `You can create up to ${tier.features.maxProjects} projects with your ${tier.name} plan.`
        }

      case 'GENERATE_LAYOUT':
        const dailyLimit = tier.limits.layoutGenerationsPerDay
        const monthlyLimit = tier.limits.layoutGenerationsPerMonth
        
        if (dailyLimit === -1) return { allowed: true }
        
        const dailyUsage = currentUsage.layoutGenerationsToday || 0
        const monthlyUsage = currentUsage.layoutGenerationsThisMonth || 0
        
        if (dailyUsage >= dailyLimit) {
          return {
            allowed: false,
            limit: dailyLimit,
            current: dailyUsage,
            resetTime: this.getNextDayReset(),
            message: `Daily limit of ${dailyLimit} layout generations reached. Resets at midnight.`
          }
        }
        
        if (monthlyUsage >= monthlyLimit) {
          return {
            allowed: false,
            limit: monthlyLimit,
            current: monthlyUsage,
            resetTime: this.getNextMonthReset(),
            message: `Monthly limit of ${monthlyLimit} layout generations reached.`
          }
        }
        
        return { allowed: true }

      case 'EXPORT_FORMAT':
        const format = currentUsage.exportFormat
        return {
          allowed: tier.features.exportFormats.includes(format),
          supportedFormats: tier.features.exportFormats,
          message: `${format} export is not available in your ${tier.name} plan.`
        }

      case 'API_ACCESS':
        return {
          allowed: tier.features.apiAccess,
          message: `API access is not available in your ${tier.name} plan.`
        }

      case 'CUSTOM_SPACE_TYPES':
        return {
          allowed: tier.features.customSpaceTypes,
          message: `Custom space types are not available in your ${tier.name} plan.`
        }

      default:
        return { allowed: true }
    }
  }

  // Get user's current usage statistics
  async getUserUsage(userId) {
    // In a real app, this would fetch from a database
    const cached = this.usageCache.get(userId)
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data
    }

    // Simulate fetching usage data
    const usage = this.getStoredUsage(userId)
    
    this.usageCache.set(userId, {
      data: usage,
      timestamp: Date.now()
    })
    
    return usage
  }

  // Get usage from localStorage (for demo purposes)
  getStoredUsage(userId) {
    const key = `archilyzer_usage_${userId}`
    const stored = localStorage.getItem(key)
    
    if (stored) {
      return JSON.parse(stored)
    }
    
    // Initialize usage tracking
    const initialUsage = {
      projectCount: 0,
      layoutGenerationsToday: 0,
      layoutGenerationsThisMonth: 0,
      lastGenerationDate: null,
      lastResetDate: new Date().toISOString().split('T')[0],
      apiRequestsThisHour: 0,
      lastApiRequestTime: null
    }
    
    localStorage.setItem(key, JSON.stringify(initialUsage))
    return initialUsage
  }

  // Update usage statistics
  updateUsage(userId, action, data = {}) {
    const usage = this.getStoredUsage(userId)
    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().substring(0, 7)
    
    // Reset daily counters if it's a new day
    if (usage.lastResetDate !== today) {
      usage.layoutGenerationsToday = 0
      usage.lastResetDate = today
    }
    
    // Reset monthly counters if it's a new month
    const lastMonth = usage.lastResetDate ? usage.lastResetDate.substring(0, 7) : thisMonth
    if (lastMonth !== thisMonth) {
      usage.layoutGenerationsThisMonth = 0
    }
    
    switch (action) {
      case 'PROJECT_CREATED':
        usage.projectCount += 1
        break
        
      case 'PROJECT_DELETED':
        usage.projectCount = Math.max(0, usage.projectCount - 1)
        break
        
      case 'LAYOUT_GENERATED':
        usage.layoutGenerationsToday += 1
        usage.layoutGenerationsThisMonth += 1
        usage.lastGenerationDate = new Date().toISOString()
        break
        
      case 'API_REQUEST':
        const now = Date.now()
        const hourAgo = now - (60 * 60 * 1000)
        
        // Reset hourly counter if needed
        if (!usage.lastApiRequestTime || usage.lastApiRequestTime < hourAgo) {
          usage.apiRequestsThisHour = 0
        }
        
        usage.apiRequestsThisHour += 1
        usage.lastApiRequestTime = now
        break
    }
    
    const key = `archilyzer_usage_${userId}`
    localStorage.setItem(key, JSON.stringify(usage))
    
    // Update cache
    this.usageCache.set(userId, {
      data: usage,
      timestamp: Date.now()
    })
    
    return usage
  }

  // Check if cached data is still valid (5 minutes)
  isCacheValid(timestamp) {
    return Date.now() - timestamp < 5 * 60 * 1000
  }

  // Get next day reset time
  getNextDayReset() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow.toISOString()
  }

  // Get next month reset time
  getNextMonthReset() {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(1)
    nextMonth.setHours(0, 0, 0, 0)
    return nextMonth.toISOString()
  }

  // Get upgrade recommendations
  getUpgradeRecommendation(user, blockedAction) {
    const currentTier = this.getTierDetails(user.subscriptionTier)
    
    if (currentTier.id === 'basic') {
      return {
        recommendedTier: 'PRO',
        benefits: [
          '25 projects (vs 5 current)',
          '50 layout generations per day (vs 10 current)',
          'Priority support',
          'Export to CAD formats',
          'API access'
        ],
        savings: 'Save hours of manual work with increased limits'
      }
    }
    
    if (currentTier.id === 'pro') {
      return {
        recommendedTier: 'ENTERPRISE',
        benefits: [
          'Unlimited projects and generations',
          'All export formats including DWG and IFC',
          'Dedicated support',
          'White-label options',
          'SSO integration'
        ],
        savings: 'Perfect for teams and large organizations'
      }
    }
    
    return null
  }

  // Format usage for display
  formatUsageDisplay(usage, tier) {
    const displays = []
    
    if (tier.features.maxProjects !== -1) {
      displays.push({
        label: 'Projects',
        current: usage.projectCount || 0,
        limit: tier.features.maxProjects,
        percentage: Math.round(((usage.projectCount || 0) / tier.features.maxProjects) * 100)
      })
    }
    
    if (tier.limits.layoutGenerationsPerDay !== -1) {
      displays.push({
        label: 'Daily Generations',
        current: usage.layoutGenerationsToday || 0,
        limit: tier.limits.layoutGenerationsPerDay,
        percentage: Math.round(((usage.layoutGenerationsToday || 0) / tier.limits.layoutGenerationsPerDay) * 100)
      })
    }
    
    if (tier.limits.layoutGenerationsPerMonth !== -1) {
      displays.push({
        label: 'Monthly Generations',
        current: usage.layoutGenerationsThisMonth || 0,
        limit: tier.limits.layoutGenerationsPerMonth,
        percentage: Math.round(((usage.layoutGenerationsThisMonth || 0) / tier.limits.layoutGenerationsPerMonth) * 100)
      })
    }
    
    return displays
  }
}

export const subscriptionService = new SubscriptionService()
export default subscriptionService
