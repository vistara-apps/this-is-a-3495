import React, { useState, useEffect } from 'react'
import { User, Settings, CreditCard, BarChart3, Download, Shield, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import subscriptionService, { SUBSCRIPTION_TIERS } from '../services/subscriptionService'
import exportService from '../services/exportService'

export default function UserProfile() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserUsage()
    }
  }, [user])

  const loadUserUsage = async () => {
    try {
      const userUsage = await subscriptionService.getUserUsage(user.userID)
      setUsage(userUsage)
    } catch (error) {
      console.error('Failed to load usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentTier = subscriptionService.getTierDetails(user?.subscriptionTier || 'basic')
  const usageDisplays = usage ? subscriptionService.formatUsageDisplay(usage, currentTier) : []

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'usage', label: 'Usage', icon: BarChart3 },
    { id: 'exports', label: 'Exports', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="text"
              value={user?.userID || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
            <input
              type="text"
              value={new Date().toLocaleDateString()}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
            Change Password
          </button>
          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200">
            Download Account Data
          </button>
          <button 
            onClick={logout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md border border-red-200"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )

  const renderSubscriptionTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentTier.id === 'basic' ? 'bg-blue-100 text-blue-800' :
            currentTier.id === 'pro' ? 'bg-purple-100 text-purple-800' :
            'bg-gold-100 text-gold-800'
          }`}>
            {currentTier.name}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Monthly Price</p>
            <p className="text-2xl font-bold text-gray-900">${currentTier.price}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Next Billing Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Plan Features</h4>
          <ul className="space-y-2">
            <li className="flex items-center text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-500 mr-2" />
              {currentTier.features.maxProjects === -1 ? 'Unlimited' : currentTier.features.maxProjects} projects
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-500 mr-2" />
              {currentTier.features.maxLayoutsPerProject === -1 ? 'Unlimited' : currentTier.features.maxLayoutsPerProject} layouts per project
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-500 mr-2" />
              Export formats: {currentTier.features.exportFormats.join(', ')}
            </li>
            <li className="flex items-center text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-500 mr-2" />
              {currentTier.features.support} support
            </li>
            {currentTier.features.apiAccess && (
              <li className="flex items-center text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-500 mr-2" />
                API access included
              </li>
            )}
          </ul>
        </div>
      </div>

      {currentTier.id !== 'enterprise' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upgrade Your Plan</h3>
          <p className="text-gray-600 mb-4">
            Get more projects, layouts, and advanced features with a higher tier plan.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(SUBSCRIPTION_TIERS)
              .filter(tier => tier.price > currentTier.price)
              .map(tier => (
                <div key={tier.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                    <span className="text-lg font-bold text-gray-900">${tier.price}/mo</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 mb-4">
                    <li>• {tier.features.maxProjects === -1 ? 'Unlimited' : tier.features.maxProjects} projects</li>
                    <li>• {tier.features.maxLayoutsPerProject === -1 ? 'Unlimited' : tier.features.maxLayoutsPerProject} layouts/project</li>
                    <li>• {tier.features.exportFormats.length} export formats</li>
                  </ul>
                  <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors">
                    Upgrade to {tier.name}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderUsageTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {usageDisplays.map((display, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{display.label}</span>
                  <span className="text-sm text-gray-600">
                    {display.current} / {display.limit === -1 ? '∞' : display.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      display.percentage > 80 ? 'bg-red-500' :
                      display.percentage > 60 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(display.percentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{display.percentage}% used</p>
              </div>
            ))}
            
            {usage && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-700">Last Generation</p>
                  <p className="text-sm text-gray-600">
                    {usage.lastGenerationDate 
                      ? new Date(usage.lastGenerationDate).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">This Month</p>
                  <p className="text-sm text-gray-600">
                    {usage.layoutGenerationsThisMonth || 0} generations
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {usage && currentTier.id !== 'enterprise' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Usage Reminder</h4>
              <p className="text-sm text-yellow-700 mt-1">
                You've used {Math.round((usage.layoutGenerationsThisMonth / currentTier.limits.layoutGenerationsPerMonth) * 100)}% 
                of your monthly layout generation limit. Consider upgrading if you need more capacity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderExportsTab = () => {
    const availableFormats = exportService.getAvailableFormats(user)
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Export Formats</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableFormats.map(format => {
              const details = exportService.getFormatDetails(format)
              return (
                <div key={format} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{details.name}</h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {details.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{details.description}</p>
                  <p className="text-xs text-gray-500">Extension: {details.extension}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export History</h3>
          <div className="text-center py-8 text-gray-500">
            <Download className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No exports yet</p>
            <p className="text-sm">Your export history will appear here</p>
          </div>
        </div>
      </div>
    )
  }

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive updates about your projects and layouts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Layout Generation Notifications</p>
              <p className="text-sm text-gray-600">Get notified when layouts are ready</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Usage Alerts</p>
              <p className="text-sm text-gray-600">Alert when approaching usage limits</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Building Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Office Building</option>
              <option>Residential Complex</option>
              <option>Retail Space</option>
              <option>Mixed Use</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Export Format
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
              {availableFormats.map(format => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your profile, subscription, and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'subscription' && renderSubscriptionTab()}
          {activeTab === 'usage' && renderUsageTab()}
          {activeTab === 'exports' && renderExportsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>
    </div>
  )
}
