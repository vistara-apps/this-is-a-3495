import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-soft border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3 group">
            <div className="p-2 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
              <Building2 className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">#ARCHILYZER</h1>
              <p className="text-xs text-gray-500 -mt-1">Instant architectural layouts</p>
            </div>
          </Link>

          {user && (
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                <div className="p-1 bg-secondary-100 rounded-lg">
                  <User className="h-4 w-4 text-secondary-600" />
                </div>
                <span className="font-medium">{user.email}</span>
                <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {user.subscriptionTier}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 p-2 hover:bg-gray-100 rounded-xl"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
