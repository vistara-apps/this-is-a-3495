import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Building, Calendar, MapPin, BarChart3 } from 'lucide-react'
import { useProject } from '../contexts/ProjectContext'

export default function Dashboard() {
  const { projects } = useProject()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your architectural projects</p>
        </div>
        <Link
          to="/project/new"
          className="mt-6 sm:mt-0 btn-primary inline-flex items-center shadow-medium hover:shadow-strong"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Project
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card card-hover p-6 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-2xl group-hover:bg-primary-200 transition-colors">
                <Building className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900 animate-pulse-soft">{projects.length}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card card-hover p-6 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-success-100 rounded-2xl group-hover:bg-success-200 transition-colors">
                <BarChart3 className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Layouts Generated</p>
                <p className="text-3xl font-bold text-gray-900 animate-pulse-soft">
                  {projects.reduce((sum, project) => sum + (project.layouts?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card card-hover p-6 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-secondary-100 rounded-2xl group-hover:bg-secondary-200 transition-colors">
                <Calendar className="h-8 w-8 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-3xl font-bold text-gray-900 animate-pulse-soft">
                  {projects.filter(p => {
                    const projectDate = new Date(p.createdAt)
                    const now = new Date()
                    return projectDate.getMonth() === now.getMonth() && 
                           projectDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card card-hover p-6 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 bg-accent-100 rounded-2xl group-hover:bg-accent-200 transition-colors">
                <MapPin className="h-8 w-8 text-accent-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900 animate-pulse-soft">
                  {projects.filter(p => p.layouts?.length > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="card">
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and track your architectural projects</p>
            </div>
            {projects.length > 0 && (
              <div className="text-sm text-gray-500">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-16 px-8">
            <div className="p-4 bg-gray-100 rounded-3xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Building className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">No projects yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Get started by creating your first architectural project and generate professional layouts instantly.</p>
            <Link
              to="/project/new"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {projects.map((project, index) => (
              <div key={project.projectID} className="p-8 hover:bg-gray-50 transition-all duration-200 group animate-slide-up" style={{animationDelay: `${index * 100}ms`}}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{project.projectName}</h3>
                      {project.layouts?.length > 0 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
                          <div className="w-2 h-2 bg-success-400 rounded-full mr-2"></div>
                          Active
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <div className="p-1 bg-primary-100 rounded-lg mr-2">
                          <Building className="h-4 w-4 text-primary-600" />
                        </div>
                        {project.buildingType}
                      </div>
                      <div className="flex items-center">
                        <div className="p-1 bg-accent-100 rounded-lg mr-2">
                          <MapPin className="h-4 w-4 text-accent-600" />
                        </div>
                        {project.location}
                      </div>
                      <div className="flex items-center">
                        <div className="p-1 bg-secondary-100 rounded-lg mr-2">
                          <Calendar className="h-4 w-4 text-secondary-600" />
                        </div>
                        {project.schedule}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        {project.spaceRequirements?.length || 0} space requirements
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                        {project.layouts?.length || 0} layouts generated
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 lg:mt-0 lg:ml-8 flex space-x-3">
                    {project.layouts?.length > 0 ? (
                      <Link
                        to={`/project/${project.projectID}/generate`}
                        className="inline-flex items-center px-6 py-3 bg-success-100 text-success-700 rounded-xl hover:bg-success-200 transition-all duration-200 font-medium shadow-soft hover:shadow-medium"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Layouts
                      </Link>
                    ) : (
                      <Link
                        to={`/project/${project.projectID}/generate`}
                        className="btn-primary inline-flex items-center"
                      >
                        <Building className="h-4 w-4 mr-2" />
                        Generate Layouts
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
