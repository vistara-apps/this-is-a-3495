// Export service for downloading layouts in various formats
import subscriptionService from './subscriptionService'

class ExportService {
  constructor() {
    this.supportedFormats = ['PNG', 'SVG', 'PDF', 'DXF', 'DWG', 'IFC']
  }

  // Check if user can export in the requested format
  canExportFormat(user, format) {
    const usage = { exportFormat: format }
    return subscriptionService.canPerformAction(user, 'EXPORT_FORMAT', usage)
  }

  // Export layout as PNG
  async exportAsPNG(layout, options = {}) {
    const {
      width = 1920,
      height = 1080,
      scale = 2,
      backgroundColor = '#ffffff'
    } = options

    try {
      // Create a canvas element
      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const ctx = canvas.getContext('2d')

      // Set background
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Create an image from SVG
      const svgBlob = new Blob([layout.svgData], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(svgBlob)
      
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(svgUrl)
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          this.downloadBlob(blob, `layout-${layout.layoutID}.png`)
        }, 'image/png')
      }
      
      img.src = svgUrl
    } catch (error) {
      console.error('PNG export failed:', error)
      throw new Error('Failed to export as PNG')
    }
  }

  // Export layout as SVG
  async exportAsSVG(layout, options = {}) {
    const {
      includeMetadata = true,
      optimize = true
    } = options

    try {
      let svgContent = layout.svgData

      // Add metadata if requested
      if (includeMetadata) {
        const metadata = this.generateMetadata(layout)
        svgContent = this.addMetadataToSVG(svgContent, metadata)
      }

      // Optimize SVG if requested
      if (optimize) {
        svgContent = this.optimizeSVG(svgContent)
      }

      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      this.downloadBlob(blob, `layout-${layout.layoutID}.svg`)
    } catch (error) {
      console.error('SVG export failed:', error)
      throw new Error('Failed to export as SVG')
    }
  }

  // Export layout as PDF
  async exportAsPDF(layout, options = {}) {
    const {
      pageSize = 'A4',
      orientation = 'landscape',
      includeMetrics = true,
      includeTitle = true
    } = options

    try {
      // This would typically use a PDF library like jsPDF
      // For now, we'll create a simple PDF-like structure
      const pdfContent = this.generatePDFContent(layout, {
        pageSize,
        orientation,
        includeMetrics,
        includeTitle
      })

      const blob = new Blob([pdfContent], { type: 'application/pdf' })
      this.downloadBlob(blob, `layout-${layout.layoutID}.pdf`)
    } catch (error) {
      console.error('PDF export failed:', error)
      throw new Error('Failed to export as PDF')
    }
  }

  // Export layout as DXF (AutoCAD format)
  async exportAsDXF(layout, options = {}) {
    const {
      units = 'feet',
      precision = 2,
      layerName = 'LAYOUT'
    } = options

    try {
      const dxfContent = this.generateDXFContent(layout, {
        units,
        precision,
        layerName
      })

      const blob = new Blob([dxfContent], { type: 'application/dxf' })
      this.downloadBlob(blob, `layout-${layout.layoutID}.dxf`)
    } catch (error) {
      console.error('DXF export failed:', error)
      throw new Error('Failed to export as DXF')
    }
  }

  // Export layout as DWG (AutoCAD native format)
  async exportAsDWG(layout, options = {}) {
    // DWG is a proprietary binary format, typically requires server-side conversion
    try {
      // In a real implementation, this would call a server endpoint
      // that converts the layout data to DWG format
      const response = await fetch('/api/export/dwg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          layoutId: layout.layoutID,
          svgData: layout.svgData,
          options
        })
      })

      if (!response.ok) {
        throw new Error('Server conversion failed')
      }

      const blob = await response.blob()
      this.downloadBlob(blob, `layout-${layout.layoutID}.dwg`)
    } catch (error) {
      console.error('DWG export failed:', error)
      // Fallback to DXF for now
      console.warn('Falling back to DXF export')
      await this.exportAsDXF(layout, options)
    }
  }

  // Export layout as IFC (Industry Foundation Classes)
  async exportAsIFC(layout, options = {}) {
    const {
      version = 'IFC4',
      includeSpaces = true,
      includeWalls = true
    } = options

    try {
      const ifcContent = this.generateIFCContent(layout, {
        version,
        includeSpaces,
        includeWalls
      })

      const blob = new Blob([ifcContent], { type: 'application/ifc' })
      this.downloadBlob(blob, `layout-${layout.layoutID}.ifc`)
    } catch (error) {
      console.error('IFC export failed:', error)
      throw new Error('Failed to export as IFC')
    }
  }

  // Main export function that routes to appropriate format handler
  async exportLayout(layout, format, user, options = {}) {
    // Check if user can export in this format
    const permission = this.canExportFormat(user, format)
    if (!permission.allowed) {
      throw new Error(permission.message)
    }

    const formatUpper = format.toUpperCase()
    
    switch (formatUpper) {
      case 'PNG':
        return await this.exportAsPNG(layout, options)
      case 'SVG':
        return await this.exportAsSVG(layout, options)
      case 'PDF':
        return await this.exportAsPDF(layout, options)
      case 'DXF':
        return await this.exportAsDXF(layout, options)
      case 'DWG':
        return await this.exportAsDWG(layout, options)
      case 'IFC':
        return await this.exportAsIFC(layout, options)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  // Helper function to download blob as file
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Generate metadata for the layout
  generateMetadata(layout) {
    return {
      layoutId: layout.layoutID,
      projectId: layout.projectID,
      generatedAt: new Date().toISOString(),
      metrics: layout.metrics,
      features: layout.features,
      generator: 'Archilyzer v1.0'
    }
  }

  // Add metadata to SVG
  addMetadataToSVG(svgContent, metadata) {
    const metadataXML = `
      <metadata>
        <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                 xmlns:dc="http://purl.org/dc/elements/1.1/">
          <rdf:Description>
            <dc:title>Architectural Layout</dc:title>
            <dc:creator>Archilyzer</dc:creator>
            <dc:date>${metadata.generatedAt}</dc:date>
            <dc:description>Generated layout with ${metadata.metrics.efficiency}% efficiency</dc:description>
          </rdf:Description>
        </rdf:RDF>
      </metadata>
    `
    
    return svgContent.replace('<svg', `<svg${metadataXML}<svg`)
  }

  // Optimize SVG content
  optimizeSVG(svgContent) {
    // Basic SVG optimization
    return svgContent
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/>\s+</g, '><') // Remove whitespace between tags
      .trim()
  }

  // Generate PDF content (simplified)
  generatePDFContent(layout, options) {
    // This is a simplified PDF structure
    // In production, use a proper PDF library like jsPDF or PDFKit
    return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Architectural Layout) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`
  }

  // Generate DXF content
  generateDXFContent(layout, options) {
    const { units, precision, layerName } = options
    
    // Basic DXF structure
    return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
9
$INSUNITS
70
1
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
1
0
LAYER
2
${layerName}
70
0
62
7
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
${this.generateDXFEntities(layout, options)}
0
ENDSEC
0
EOF`
  }

  // Generate DXF entities from layout
  generateDXFEntities(layout, options) {
    // This would parse the SVG and convert to DXF entities
    // For now, return a simple rectangle
    return `0
LINE
8
${options.layerName}
10
0.0
20
0.0
30
0.0
11
100.0
21
0.0
31
0.0`
  }

  // Generate IFC content
  generateIFCContent(layout, options) {
    const { version, includeSpaces, includeWalls } = options
    
    return `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('ViewDefinition [CoordinationView]'),'2;1');
FILE_NAME('layout-${layout.layoutID}.ifc','${new Date().toISOString()}',('Archilyzer'),('Archilyzer'),'Archilyzer','Archilyzer','');
FILE_SCHEMA(('${version}'));
ENDSEC;

DATA;
#1=IFCPROJECT('${layout.projectID}',#2,'Architectural Layout',$,$,$,$,(#3),#4);
#2=IFCOWNERHISTORY(#5,#6,$,.ADDED.,$,$,$,1);
#3=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,#7,$);
#4=IFCUNITASSIGNMENT((#8));
#5=IFCPERSONANDORGANIZATION(#9,#10,$);
#6=IFCAPPLICATION(#10,'1.0','Archilyzer','Archilyzer');
#7=IFCAXIS2PLACEMENT3D(#11,$,$);
#8=IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.);
#9=IFCPERSON($,'User',$,$,$,$,$,$);
#10=IFCORGANIZATION($,'Archilyzer',$,$,$);
#11=IFCCARTESIANPOINT((0.,0.,0.));
ENDSEC;

END-ISO-10303-21;`
  }

  // Get available export formats for user
  getAvailableFormats(user) {
    const tier = subscriptionService.getTierDetails(user.subscriptionTier)
    return tier.features.exportFormats
  }

  // Get export format details
  getFormatDetails(format) {
    const details = {
      PNG: {
        name: 'PNG Image',
        description: 'High-quality raster image format',
        extension: '.png',
        mimeType: 'image/png',
        category: 'Image'
      },
      SVG: {
        name: 'SVG Vector',
        description: 'Scalable vector graphics format',
        extension: '.svg',
        mimeType: 'image/svg+xml',
        category: 'Vector'
      },
      PDF: {
        name: 'PDF Document',
        description: 'Portable document format with layout and metrics',
        extension: '.pdf',
        mimeType: 'application/pdf',
        category: 'Document'
      },
      DXF: {
        name: 'AutoCAD DXF',
        description: 'AutoCAD Drawing Exchange Format',
        extension: '.dxf',
        mimeType: 'application/dxf',
        category: 'CAD'
      },
      DWG: {
        name: 'AutoCAD DWG',
        description: 'AutoCAD native drawing format',
        extension: '.dwg',
        mimeType: 'application/dwg',
        category: 'CAD'
      },
      IFC: {
        name: 'IFC Model',
        description: 'Industry Foundation Classes BIM format',
        extension: '.ifc',
        mimeType: 'application/ifc',
        category: 'BIM'
      }
    }

    return details[format.toUpperCase()] || null
  }
}

export const exportService = new ExportService()
export default exportService
