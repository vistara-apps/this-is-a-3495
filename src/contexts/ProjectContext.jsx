import React, { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const ProjectContext = createContext()

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)

  useEffect(() => {
    // Load projects from localStorage
    const storedProjects = localStorage.getItem('archilyzer_projects')
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects))
    }
  }, [])

  const saveProjects = (updatedProjects) => {
    setProjects(updatedProjects)
    localStorage.setItem('archilyzer_projects', JSON.stringify(updatedProjects))
  }

  const createProject = (projectData) => {
    const newProject = {
      projectID: uuidv4(),
      ...projectData,
      createdAt: new Date().toISOString(),
      spaceRequirements: [],
      layouts: []
    }
    
    const updatedProjects = [...projects, newProject]
    saveProjects(updatedProjects)
    setCurrentProject(newProject)
    return newProject
  }

  const updateProject = (projectID, updates) => {
    const updatedProjects = projects.map(project => 
      project.projectID === projectID 
        ? { ...project, ...updates }
        : project
    )
    saveProjects(updatedProjects)
    
    if (currentProject?.projectID === projectID) {
      setCurrentProject({ ...currentProject, ...updates })
    }
  }

  const addSpaceRequirement = (projectID, spaceReq) => {
    const project = projects.find(p => p.projectID === projectID)
    if (project) {
      const updatedSpaceReqs = [...project.spaceRequirements, { ...spaceReq, id: uuidv4() }]
      updateProject(projectID, { spaceRequirements: updatedSpaceReqs })
    }
  }

  const removeSpaceRequirement = (projectID, spaceReqId) => {
    const project = projects.find(p => p.projectID === projectID)
    if (project) {
      const updatedSpaceReqs = project.spaceRequirements.filter(req => req.id !== spaceReqId)
      updateProject(projectID, { spaceRequirements: updatedSpaceReqs })
    }
  }

  const addLayouts = (projectID, layouts) => {
    updateProject(projectID, { layouts })
  }

  const getProject = (projectID) => {
    return projects.find(p => p.projectID === projectID)
  }

  const value = {
    projects,
    currentProject,
    setCurrentProject,
    createProject,
    updateProject,
    addSpaceRequirement,
    removeSpaceRequirement,
    addLayouts,
    getProject
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}