# Archilyzer API Documentation

## Overview
Archilyzer provides RESTful APIs for architectural layout generation and project management.

## Base URL
```
Production: https://api.archilyzer.com/v1
Development: http://localhost:3001/api/v1
```

## Authentication
All API requests require authentication using Bearer tokens.

```http
Authorization: Bearer <your-api-token>
```

## Core Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "userID": "uuid",
      "email": "user@example.com",
      "subscriptionTier": "basic"
    },
    "token": "jwt-token"
  }
}
```

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "subscriptionTier": "basic"
}
```

### Projects

#### GET /projects
Get all projects for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "projectID": "uuid",
      "userID": "uuid",
      "projectName": "Office Building Downtown",
      "buildingType": "Office Building",
      "location": "New York, NY",
      "schedule": "6 months",
      "spaceRequirements": [
        {
          "id": "uuid",
          "roomType": "Office",
          "squareFootage": "200",
          "quantity": 5
        }
      ],
      "layouts": [],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /projects
Create a new project.

**Request Body:**
```json
{
  "projectName": "Office Building Downtown",
  "buildingType": "Office Building",
  "location": "New York, NY",
  "schedule": "6 months"
}
```

#### GET /projects/:id
Get a specific project by ID.

#### PUT /projects/:id
Update a project.

#### DELETE /projects/:id
Delete a project.

### Space Requirements

#### POST /projects/:id/space-requirements
Add space requirements to a project.

**Request Body:**
```json
{
  "roomType": "Conference Room",
  "squareFootage": "300",
  "quantity": 2
}
```

#### DELETE /projects/:projectId/space-requirements/:id
Remove a space requirement.

### Layout Generation

#### POST /generate_layout
Generate layout options for a project.

**Request Body:**
```json
{
  "projectID": "uuid",
  "spaceRequirements": [
    {
      "roomType": "Office",
      "squareFootage": "200",
      "quantity": 5
    }
  ],
  "buildingType": "Office Building",
  "location": "New York, NY",
  "preferences": {
    "style": "modern",
    "efficiency": "high"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "layoutID": "uuid",
      "projectID": "uuid",
      "svgData": "<svg>...</svg>",
      "metrics": {
        "efficiency": 85,
        "totalArea": 2500,
        "circulationArea": 375,
        "usableArea": 2125
      },
      "features": [
        "Optimized circulation flow",
        "85% space efficiency ratio",
        "Strategic placement of 3 space types"
      ]
    }
  ]
}
```

### Location Services

#### GET /geocode
Get location data for address validation and climate information.

**Query Parameters:**
- `address`: The address to geocode

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "New York, NY",
    "coordinates": {
      "lat": 40.7128,
      "lng": -74.0060
    },
    "climate": "temperate",
    "zoning": "commercial",
    "buildingCodes": ["IBC", "NYC Building Code"]
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

## Rate Limits

- **Basic Tier**: 100 requests/hour, 5 layout generations/day
- **Pro Tier**: 1000 requests/hour, 50 layout generations/day
- **Enterprise Tier**: Unlimited

## Subscription Tiers

### Basic ($29/month)
- Up to 5 projects
- 5 layout generations per project
- Basic space types
- Standard support

### Pro ($79/month)
- Up to 25 projects
- 15 layout generations per project
- Advanced space types
- Priority support
- Export to CAD formats

### Enterprise ($199/month)
- Unlimited projects
- Unlimited layout generations
- Custom space types
- API access
- Dedicated support

## Webhooks

Configure webhooks to receive notifications about layout generation completion.

#### POST /webhooks
Create a webhook endpoint.

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/archilyzer",
  "events": ["layout.generated", "project.created"]
}
```

## SDKs

### JavaScript/Node.js
```bash
npm install @archilyzer/sdk
```

```javascript
import { Archilyzer } from '@archilyzer/sdk'

const client = new Archilyzer({
  apiKey: 'your-api-key'
})

const layouts = await client.generateLayouts({
  projectID: 'uuid',
  spaceRequirements: [...]
})
```

### Python
```bash
pip install archilyzer-python
```

```python
from archilyzer import Client

client = Client(api_key='your-api-key')
layouts = client.generate_layouts(
    project_id='uuid',
    space_requirements=[...]
)
```
