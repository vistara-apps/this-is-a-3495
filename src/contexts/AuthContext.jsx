import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('archilyzer_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    // Simulate API call
    const mockUser = {
      userID: '1',
      email,
      subscriptionTier: 'basic'
    }
    
    setUser(mockUser)
    localStorage.setItem('archilyzer_user', JSON.stringify(mockUser))
    return mockUser
  }

  const register = async (email, password) => {
    // Simulate API call
    const mockUser = {
      userID: Date.now().toString(),
      email,
      subscriptionTier: 'basic'
    }
    
    setUser(mockUser)
    localStorage.setItem('archilyzer_user', JSON.stringify(mockUser))
    return mockUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('archilyzer_user')
  }

  const value = {
    user,
    login,
    register,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}