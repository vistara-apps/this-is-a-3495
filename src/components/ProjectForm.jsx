import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Building, MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { useProject } from '../contexts/ProjectContext'

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
  
  const [formData, setFormData] = useState({
    projectName: '',
    buildingType: '',
    location: '',
    schedule: ''
  })
  
  const [spaceRequirements, setSpaceRequirements] = useState([
    { roomType: '', squareFootage: '', quantity: 1 }
  ])
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touchedFields, setTouchedFields] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  const handleFieldBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }))
    validateField(fieldName, formData[fieldName])
  }
  
  const validateField = (fieldName, value) => {
    let error = ''
    
    switch (fieldName) {
      case 'projectName':
        if (!value.trim()) error = 'Project name is required'
        else if (value.trim().length < 3) error = 'Project name must be at least 3 characters'
        break
      case 'buildingType':
        if (!value) error = 'Building type is required'
        break
      case 'location':
        if (!value.trim()) error = 'Location is required'
        break
      case 'schedule':
        if (!value.trim()) error = 'Schedule is required'
        break
    }
    
    setErrors(prev => ({ ...prev, [fieldName]: error }))
    return error === ''
  }
  
  const validateSpaceRequirements = () => {
    const validSpaceReqs = spaceRequirements.filter(req => 
      req.roomType && req.squareFootage && req.quantity > 0
    )
    
    if (validSpaceReqs.length === 0) {
      setErrors(prev => ({ ...prev, spaceRequirements: 'Please add at least one valid space requirement' }))
      return false
    }
    
    setErrors(prev => ({ ...prev, spaceRequirements: '' }))
    return true
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Validate all fields
    const isProjectNameValid = validateField('projectName', formData.projectName)
    const isBuildingTypeValid = validateField('buildingType', formData.buildingType)
    const isLocationValid = validateField('location', formData.location)
    const isScheduleValid = validateField('schedule', formData.schedule)
    const areSpaceReqsValid = validateSpaceRequirements()
    
    const isFormValid = isProjectNameValid && isBuildingTypeValid && isLocationValid && isScheduleValid && areSpaceReqsValid
    
    if (!isFormValid) {
      setIsSubmitting(false)
      return
    }

    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create project
      const validSpaceReqs = spaceRequirements.filter(req => 
        req.roomType && req.squareFootage && req.quantity > 0
      )
      
      const projectData = {
        ...formData,
        userID: '1', // This would come from auth context in a real app
        spaceRequirements: validSpaceReqs
      }

      const newProject = createProject(projectData)
      navigate(`/project/${newProject.projectID}/generate`)
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: 'Failed to create project. Please try again.' }))
    } finally {
      setIsSubmitting(false)
    }
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

      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
        {/* Project Details */}
        <div className="card p-8">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-primary-100 rounded-xl mr-3">
              <Building className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
              <p className="text-sm text-gray-600">Basic information about your project</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="projectName" className="form-label">
                Project Name *
              </label>
              <div className="relative">
                <input
                  id="projectName"
                  name="projectName"
                  type="text"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('projectName')}
                  className={`form-input ${errors.projectName && touchedFields.projectName ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="Enter project name"
                />
                {formData.projectName && !errors.projectName && (
                  <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-success-500" />
                )}
              </div>
              {errors.projectName && touchedFields.projectName && (
                <div className="flex items-center text-error-600 text-sm animate-slide-up">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.projectName}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="buildingType" className="form-label">
                Building Type *
              </label>
              <div className="relative">
                <select
                  id="buildingType"
                  name="buildingType"
                  value={formData.buildingType}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('buildingType')}
                  className={`form-input ${errors.buildingType && touchedFields.buildingType ? 'border-error-500 focus:ring-error-500' : ''}`}
                >
                  <option value="">Select building type</option>
                  {buildingTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {formData.buildingType && !errors.buildingType && (
                  <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-success-500" />
                )}
              </div>
              {errors.buildingType && touchedFields.buildingType && (
                <div className="flex items-center text-error-600 text-sm animate-slide-up">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.buildingType}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="form-label">
                <MapPin className="h-4 w-4 inline mr-1" />
                Location *
              </label>
              <div className="relative">
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('location')}
                  className={`form-input ${errors.location && touchedFields.location ? 'border-error-500 focus:ring-error-500' : ''}`}
                  placeholder="City, State"
                />
                {formData.location && !errors.location && (
                  <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-success-500" />
                )}
              </div>
              {errors.location && touchedFields.location && (
                <div className="flex items-center text-error-600 text-sm animate-slide-up">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.location}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="schedule" className="form-label">
                <Calendar className="h-4 w-4 inline mr-1" />
                Project Schedule *
              </label>
              <div className="relative">
                <select
                  id="schedule"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleInputChange}
                  onBlur={() => handleFieldBlur('schedule')}
                  className={`form-input ${errors.schedule && touchedFields.schedule ? 'border-error-500 focus:ring-error-500' : ''}`}
                >
                  <option value="">Select timeline</option>
                  <option value="Rush (1-2 weeks)">Rush (1-2 weeks)</option>
                  <option value="Standard (1-2 months)">Standard (1-2 months)</option>
                  <option value="Extended (3-6 months)">Extended (3-6 months)</option>
                  <option value="Long-term (6+ months)">Long-term (6+ months)</option>
                </select>
                {formData.schedule && !errors.schedule && (
                  <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-success-500" />
                )}
              </div>
              {errors.schedule && touchedFields.schedule && (
                <div className="flex items-center text-error-600 text-sm animate-slide-up">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.schedule}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Space Requirements */}
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-accent-100 rounded-xl mr-3">
                <div className="h-6 w-6 bg-accent-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">#</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Space Requirements</h2>
                <p className="text-sm text-gray-600">Define the spaces needed for your project</p>
              </div>
            </div>
            {totalSquareFootage > 0 && (
              <div className="bg-primary-50 px-4 py-2 rounded-xl">
                <div className="text-sm text-primary-600 font-medium">
                  Total: {totalSquareFootage.toLocaleString()} sq ft
                </div>
              </div>
            )}
          </div>
          
          {errors.spaceRequirements && (
            <div className="mb-4 flex items-center text-error-600 text-sm animate-slide-up bg-error-50 p-3 rounded-xl">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.spaceRequirements}
            </div>
          )}

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
            className="mt-4 flex items-center px-4 py-2 text-primary-600 border-2 border-dashed border-primary-300 rounded-xl hover:bg-primary-50 hover:border-primary-400 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Space Requirement
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          {errors.submit && (
            <div className="flex items-center text-error-600 text-sm animate-slide-up bg-error-50 p-3 rounded-xl">
              <AlertCircle className="h-4 w-4 mr-2" />
              {errors.submit}
            </div>
          )}
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary relative"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner h-5 w-5 mr-2"></div>
                  Creating Project...
                </>
              ) : (
                <>
                  <Building className="h-5 w-5 mr-2" />
                  Create Project & Generate Layouts
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
