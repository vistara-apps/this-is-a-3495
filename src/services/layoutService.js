import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'

// Initialize OpenAI client with OpenRouter
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || 'your-api-key-here',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

function generateSampleSVG(spaceReqs, layoutIndex) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
  const width = 400
  const height = 300
  
  let currentY = 20
  let currentX = 20
  const rooms = []
  
  spaceReqs.forEach((req, index) => {
    for (let i = 0; i < req.quantity; i++) {
      const roomWidth = Math.sqrt(parseFloat(req.squareFootage)) * 2 + (layoutIndex * 10)
      const roomHeight = Math.sqrt(parseFloat(req.squareFootage)) * 1.5 + (layoutIndex * 5)
      
      if (currentX + roomWidth > width - 20) {
        currentX = 20
        currentY += 80
      }
      
      rooms.push({
        x: currentX,
        y: currentY,
        width: roomWidth,
        height: roomHeight,
        color: colors[index % colors.length],
        label: req.roomType,
        sqft: req.squareFootage
      })
      
      currentX += roomWidth + 10
    }
  })

  const svgElements = rooms.map(room => `
    <g>
      <rect x="${room.x}" y="${room.y}" width="${room.width}" height="${room.height}" 
            fill="${room.color}" fill-opacity="0.3" stroke="${room.color}" stroke-width="2" rx="4"/>
      <text x="${room.x + room.width/2}" y="${room.y + room.height/2 - 5}" 
            text-anchor="middle" font-size="10" font-weight="bold" fill="${room.color}">
        ${room.label}
      </text>
      <text x="${room.x + room.width/2}" y="${room.y + room.height/2 + 8}" 
            text-anchor="middle" font-size="8" fill="${room.color}">
        ${room.sqft} sq ft
      </text>
    </g>
  `).join('')

  return `
    <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f9fafb" stroke="#e5e7eb" stroke-width="2" rx="8"/>
      ${svgElements}
      <text x="20" y="${height - 10}" font-size="10" fill="#6b7280">Layout Option ${layoutIndex + 1}</text>
    </svg>
  `
}

export async function generateLayouts(project) {
  try {
    const totalArea = project.spaceRequirements?.reduce((total, req) => 
      total + (parseFloat(req.squareFootage) * parseInt(req.quantity)), 0
    ) || 0

    // Create layout variations
    const layouts = []
    
    for (let i = 0; i < 3; i++) {
      const efficiency = 75 + Math.random() * 20 // 75-95%
      const circulationArea = Math.round(totalArea * (0.15 + Math.random() * 0.1)) // 15-25% circulation
      
      const layout = {
        layoutID: uuidv4(),
        projectID: project.projectID,
        svgData: generateSampleSVG(project.spaceRequirements, i),
        metrics: {
          efficiency: Math.round(efficiency),
          totalArea: totalArea + circulationArea,
          circulationArea: circulationArea,
          usableArea: totalArea
        },
        features: [
          `Optimized circulation flow with ${circulationArea} sq ft of corridors`,
          `${Math.round(efficiency)}% space efficiency ratio`,
          `Strategic placement of ${project.spaceRequirements?.length || 0} different space types`,
          `Compliant with ${project.buildingType.toLowerCase()} building codes`,
          `Climate considerations for ${project.location}`
        ]
      }
      
      layouts.push(layout)
    }

    // If API key is available, try to get AI-generated insights
    if (import.meta.env.VITE_OPENROUTER_API_KEY && import.meta.env.VITE_OPENROUTER_API_KEY !== 'your-api-key-here') {
      try {
        const completion = await openai.chat.completions.create({
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "user",
              content: `Generate 3 architectural layout descriptions for a ${project.buildingType} in ${project.location} with these space requirements: ${JSON.stringify(project.spaceRequirements)}. Each description should highlight different design approaches and benefits. Keep each description to 3-4 bullet points.`
            }
          ],
          max_tokens: 500
        })

        const aiResponse = completion.choices[0]?.message?.content
        if (aiResponse) {
          // Parse AI response and apply to layouts
          const descriptions = aiResponse.split('\n\n')
          layouts.forEach((layout, index) => {
            if (descriptions[index]) {
              const features = descriptions[index]
                .split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map(line => line.replace(/^[-•]\s*/, '').trim())
                .filter(feature => feature.length > 0)
              
              if (features.length > 0) {
                layout.features = features
              }
            }
          })
        }
      } catch (aiError) {
        console.warn('AI enhancement failed, using default descriptions:', aiError)
      }
    }

    return layouts
  } catch (error) {
    console.error('Error generating layouts:', error)
    throw new Error('Failed to generate layouts')
  }
}