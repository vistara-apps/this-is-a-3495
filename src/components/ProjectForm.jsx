import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Building, MapPin, Calendar, AlertCircle } from 'lucide-react'
import { useProject } from '../contexts/ProjectContext'
import { useAuth } from '../contexts/AuthContext'
import subscriptionService from '../services/subscriptionService'

const buildingTypes = [
  'Office Building',
  'Residential Complex',
  'Retail Space',
  'Restaurant',
  'Hotel',
  'Educational Facility',
  'Healthcare Facility',
  'Mixed Use',
  'Warehouse',
  'Other'
]

const roomTypes = [
  'Office',
  'Conference Room',
  'Reception',
  'Bathroom',
  'Kitchen',
  'Storage',
  'Bedroom',
  'Living Room',
  'Dining Room',
  'Lobby',
  'Corridor',
  'Utility Room',
  'Other'
]

export default function ProjectForm() {
  const navigate = useNavigate()
  const { createProject } = useProject()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    projectName: '',
    buildingType: '',
    location: '',
    schedule: ''
  })
  
  const [spaceRequirements, setSpaceRequirements] = useState([
    { roomType: '', squareFootage: '', quantity: 1 }
  ])
  
  const [usage, setUsage] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadUsage()
    }
  }, [user])

  const loadUsage = async () => {
    try {
      const userUsage = await subscriptionService.getUserUsage(user.userID)
      setUsage(userUsage)
    } catch (error) {
      console.error('Failed to load usage:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSpaceReqChange = (index, field, value) => {
    const updated = [...spaceRequirements]
    updated[index] = { ...updated[index], [field]: value }
    setSpaceRequirements(updated)
  }

  const addSpaceRequirement = () => {
    setSpaceRequirements(prev => [...prev, { roomType: '', squareFootage: '', quantity: 1 }])
  }

  const removeSpaceRequirement = (index) => {
    if (spaceRequirements.length > 1) {
      setSpaceRequirements(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    // Check subscription limits
    if (user && usage) {
      const permission = subscriptionService.canPerformAction(user, 'CREATE_PROJECT', usage)
      if (!permission.allowed) {
        setError(permission.message)
        return
      }
    }
    
    // Validate required fields
    if (!formData.projectName || !formData.buildingType || !formData.location || !formData.schedule) {
      setError('Please fill in all project details')
      return
    }

    // Validate space requirements
    const validSpaceReqs = spaceRequirements.filter(req => 
      req.roomType && req.squareFootage && req.quantity > 0
    )
    
    if (validSpaceReqs.length === 0) {
      setError('Please add at least one space requirement')
      return
    }

    // Create project
    const projectData = {
      ...formData,
      userID: user?.userID || '1',
      spaceRequirements: validSpaceReqs
    }

    const newProject = createProject(projectData)
    
    // Update usage statistics
    if (user) {
      subscriptionService.updateUsage(user.userID, 'PROJECT_CREATED')
    }
    
    navigate(`/project/${newProject.projectID}/generate`)
  }

  const totalSquareFootage = spaceRequirements.reduce((total, req) => {
    const sqft = parseFloat(req.squareFootage) || 0
    const qty = parseInt(req.quantity) || 0
    return total + (sqft * qty)
  }, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Project</h1>
          <p className="text-gray-600 mt-1">Enter project details and space requirements</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Project Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <Building className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                id="projectName"
                name="projectName"
                type="text"
                value={formData.projectName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label htmlFor="buildingType" className="block text-sm font-medium text-gray-700 mb-2">
                Building Type *
              </label>
              <select
                id="buildingType"
                name="buildingType"
                value={formData.buildingType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select building type</option>
                {buildingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location *
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="City, State"
              />
            </div>

            <div>
              <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Project Schedule *
              </label>
              <select
                id="schedule"
                name="schedule"
                value={formData.schedule}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select timeline</option>
                <option value="Rush (1-2 weeks)">Rush (1-2 weeks)</option>
                <option value="Standard (1-2 months)">Standard (1-2 months)</option>
                <option value="Extended (3-6 months)">Extended (3-6 months)</option>
                <option value="Long-term (6+ months)">Long-term (6+ months)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Space Requirements */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="h-6 w-6 bg-primary-600 rounded mr-2 flex items-center justify-center">
                <span className="text-white text-sm font-bold">#</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Space Requirements</h2>
            </div>
            {totalSquareFootage > 0 && (
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold">{totalSquareFootage.toLocaleString()} sq ft</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {spaceRequirements.map((req, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type
                  </label>
                  <select
                    value={req.roomType}
                    onChange={(e) => handleSpaceReqChange(index, 'roomType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select room type</option>
                    {roomTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Square Footage
                  </label>
                  <input
                    type="number"
                    value={req.squareFootage}
                    onChange={(e) => handleSpaceReqChange(index, 'squareFootage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="sq ft"
                    min="1"
                  />
                </div>

                <div className="sm:w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={req.quantity}
                    onChange={(e) => handleSpaceReqChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeSpaceRequirement(index)}
                    disabled={spaceRequirements.length === 1}
                    className="p-2 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSpaceRequirement}
            className="mt-4 flex items-center px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Space Requirement
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Project & Generate Layouts
          </button>
        </div>
      </form>
    </div>
  )
}
