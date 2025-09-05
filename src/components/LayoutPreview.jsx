import React from 'react'
import { BarChart3, Square, ArrowRight } from 'lucide-react'

export default function LayoutPreview({ layout }) {
  if (!layout) return null

  return (
    <div className="space-y-6">
      {/* Layout Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Efficiency</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{layout.metrics.efficiency}%</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <Square className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-900">Total Area</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{layout.metrics.totalArea.toLocaleString()}</p>
          <p className="text-xs text-green-700">sq ft</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <ArrowRight className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-900">Circulation</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">{layout.metrics.circulationArea}</p>
          <p className="text-xs text-purple-700">sq ft</p>
        </div>
      </div>

      {/* SVG Layout Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="aspect-video bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
          <div 
            className="w-full h-full" 
            dangerouslySetInnerHTML={{ __html: layout.svgData }}
          />
        </div>
      </div>

      {/* Layout Description */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Layout Features</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          {layout.features?.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}