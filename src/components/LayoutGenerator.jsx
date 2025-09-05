import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, Download, BarChart3, RefreshCw } from 'lucide-react'
import { useProject } from '../contexts/ProjectContext'
import LayoutPreview from './LayoutPreview'
import { generateLayouts } from '../services/layoutService'

export default function LayoutGenerator() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, addLayouts } = useProject()
  
  const [project, setProject] = useState(null)
  const [layouts, setLayouts] = useState([])
  const [selectedLayout, setSelectedLayout] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const projectData = getProject(id)
    if (!projectData) {
      navigate('/dashboard')
      return
    }
    setProject(projectData)
    setLayouts(projectData.layouts || [])
  }, [id, getProject, navigate])

  const handleGenerateLayouts = async () => {
    if (!project) return
    
    setGenerating(true)
    setError('')
    
    try {
      const newLayouts = await generateLayouts(project)
      setLayouts(newLayouts)
      addLayouts(project.projectID, newLayouts)
      
      if (newLayouts.length > 0) {
        setSelectedLayout(newLayouts[0])
      }
    } catch (err) {
      console.error('Error generating layouts:', err)
      setError('Failed to generate layouts. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSelectLayout = (layout) => {
    setSelectedLayout(layout)
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.projectName}</h1>
          <p className="text-gray-600 mt-1">Generate and compare layout options</p>
        </div>
      </div>

      {/* Project Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Building Type</p>
            <p className="font-medium">{project.buildingType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Location</p>
            <p className="font-medium">{project.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Schedule</p>
            <p className="font-medium">{project.schedule}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Space</p>
            <p className="font-medium">
              {project.spaceRequirements?.reduce((total, req) => 
                total + (parseFloat(req.squareFootage) * parseInt(req.quantity)), 0
              ).toLocaleString() || 0} sq ft
            </p>
          </div>
        </div>
      </div>

      {/* Generate Layouts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Generation Controls */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout Generation</h3>
            
            {layouts.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">
                  Ready to generate your architectural layouts based on the project requirements.
                </p>
                <button
                  onClick={handleGenerateLayouts}
                  disabled={generating}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Generate Layouts
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    {layouts.length} layout{layouts.length !== 1 ? 's' : ''} generated
                  </p>
                  <button
                    onClick={handleGenerateLayouts}
                    disabled={generating}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                  >
                    <RefreshCw className={`h-4 w-4 mr-1 ${generating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>
                
                <div className="space-y-3">
                  {layouts.map((layout, index) => (
                    <button
                      key={layout.layoutID}
                      onClick={() => handleSelectLayout(layout)}
                      className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                        selectedLayout?.layoutID === layout.layoutID
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Layout Option {index + 1}</h4>
                        <BarChart3 className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Efficiency: {layout.metrics.efficiency}%</div>
                        <div>Circulation: {layout.metrics.circulationArea} sq ft</div>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedLayout && (
                  <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected Layout
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Space Requirements Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Space Requirements</h3>
            <div className="space-y-3">
              {project.spaceRequirements?.map((req, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{req.roomType}</p>
                    <p className="text-xs text-gray-600">Qty: {req.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{req.squareFootage} sq ft</p>
                    <p className="text-xs text-gray-600">
                      {(parseFloat(req.squareFootage) * parseInt(req.quantity)).toLocaleString()} total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Layout Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout Preview</h3>
            
            {selectedLayout ? (
              <LayoutPreview layout={selectedLayout} />
            ) : layouts.length > 0 ? (
              <div className="text-center py-12 text-gray-600">
                Select a layout option to preview
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                Generate layouts to see preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}