import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Hero section with cityscape */}
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center p-8 relative overflow-hidden">
        <div className="text-center z-10">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <Building2 className="h-12 w-12 text-primary-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">#ARCHILYZER</h1>
              <p className="text-lg text-gray-600">Instant architectural layouts from your project brief</p>
            </div>
          </div>
          
          {/* Cityscape illustration */}
          <div className="relative w-full max-w-md mx-auto mb-8">
            <svg viewBox="0 0 400 200" className="w-full h-auto">
              {/* Sky */}
              <rect width="400" height="120" fill="url(#skyGradient)" />
              
              {/* Buildings */}
              <rect x="20" y="80" width="40" height="120" fill="#4f46e5" />
              <rect x="70" y="60" width="35" height="140" fill="#3b82f6" />
              <rect x="115" y="70" width="45" height="130" fill="#1e40af" />
              <rect x="170" y="50" width="50" height="150" fill="#1d4ed8" />
              <rect x="230" y="65" width="40" height="135" fill="#2563eb" />
              <rect x="280" y="75" width="35" height="125" fill="#3b82f6" />
              <rect x="325" y="55" width="55" height="145" fill="#4f46e5" />
              
              {/* Windows */}
              <rect x="25" y="90" width="6" height="8" fill="white" opacity="0.8" />
              <rect x="35" y="90" width="6" height="8" fill="white" opacity="0.8" />
              <rect x="25" y="110" width="6" height="8" fill="white" opacity="0.8" />
              <rect x="35" y="110" width="6" height="8" fill="white" opacity="0.8" />
              
              <rect x="75" y="70" width="6" height="8" fill="white" opacity="0.8" />
              <rect x="85" y="70" width="6" height="8" fill="white" opacity="0.8" />
              <rect x="95" y="70" width="6" height="8" fill="white" opacity="0.8" />
              
              <rect x="180" y="60" width="8" height="10" fill="white" opacity="0.8" />
              <rect x="190" y="60" width="8" height="10" fill="white" opacity="0.8" />
              <rect x="200" y="60" width="8" height="10" fill="white" opacity="0.8" />
              <rect x="210" y="60" width="8" height="10" fill="white" opacity="0.8" />
              
              {/* Ground */}
              <rect x="0" y="190" width="400" height="10" fill="#e5e7eb" />
              
              <defs>
                <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#dbeafe" />
                  <stop offset="100%" stopColor="#f0f9ff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div className="max-w-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Transform Your Architectural Workflow
            </h2>
            <p className="text-gray-600 mb-6">
              Generate professional layout options instantly. Save hours of manual drafting 
              and focus on what matters most - great design.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white/80 rounded-lg p-4">
                <div className="font-semibold text-primary-600">Input Parameters</div>
                <div className="text-sm text-gray-600">Building type, location, requirements</div>
              </div>
              <div className="bg-white/80 rounded-lg p-4">
                <div className="font-semibold text-primary-600">Generate Layouts</div>
                <div className="text-sm text-gray-600">AI-powered space planning</div>
              </div>
              <div className="bg-white/80 rounded-lg p-4">
                <div className="font-semibold text-primary-600">Compare & Select</div>
                <div className="text-sm text-gray-600">Choose optimal design</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login/Register form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Get Started'}
            </h3>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">Starting at</p>
              <p className="text-2xl font-bold text-primary-600">$29/month</p>
              <p className="text-xs text-gray-500">Tiered pricing based on usage</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}