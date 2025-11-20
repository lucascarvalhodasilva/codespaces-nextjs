# API Structure for Protected Routes

## Übersicht

Alle geschützten API-Routes befinden sich unter `/src/app/api/` und nutzen die Next.js App Router API Routes.

## Struktur

```
src/app/api/
├── auth/
│   └── route.js          # POST /api/auth (Login)
├── register/
│   └── route.js          # POST /api/register
├── logout/
│   └── route.js          # POST /api/logout
├── me/
│   └── route.js          # GET /api/me (Current User)
│
├── strategies/
│   ├── route.js          # GET/POST /api/strategies
│   └── [id]/
│       └── route.js      # GET/PUT/DELETE /api/strategies/:id
│
├── trades/
│   ├── route.js          # GET/POST /api/trades
│   └── [id]/
│       └── route.js      # GET/PUT/DELETE /api/trades/:id
│
└── journal/
    ├── route.js          # GET/POST /api/journal
    └── [id]/
        └── route.js      # GET/PUT/DELETE /api/journal/:id
```

## Best Practices

### 1. Authentifizierung

**Methode 1: Manuell in jeder Route**
```javascript
import { getCurrentUser } from '@/lib/auth.js'

export async function GET(request) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Route logic
}
```

**Methode 2: Mit withAuth Wrapper (empfohlen)**
```javascript
import { withAuth, successResponse } from '@/lib/api.js'

export const GET = withAuth(async (request, context, user) => {
  // user ist automatisch verfügbar
  const data = await prisma.something.findMany()
  return successResponse(data)
})
```

### 2. Standardisierte Responses

Immer das gleiche Format verwenden:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

### 3. HTTP Status Codes

- `200` - OK (GET, PUT)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Not authenticated)
- `403` - Forbidden (Authenticated but no permission)
- `404` - Not Found
- `409` - Conflict (Duplicate entry)
- `500` - Internal Server Error

### 4. CRUD Operations Template

```javascript
import { withAuth, successResponse, errorResponse, handlePrismaError } from '@/lib/api.js'
import prisma from '@/db/prisma.js'

// GET /api/resource
export const GET = withAuth(async (request, context, user) => {
  try {
    const items = await prisma.resource.findMany({
      where: { userId: user.id }
    })
    return successResponse(items)
  } catch (error) {
    return handlePrismaError(error)
  }
})

// POST /api/resource
export const POST = withAuth(async (request, context, user) => {
  try {
    const body = await request.json()
    
    const item = await prisma.resource.create({
      data: {
        ...body,
        userId: user.id
      }
    })
    
    return successResponse(item, 201)
  } catch (error) {
    return handlePrismaError(error)
  }
})

// PUT /api/resource/[id]
export const PUT = withAuth(async (request, context, user) => {
  try {
    const id = parseInt(context.params.id)
    const body = await request.json()
    
    const item = await prisma.resource.update({
      where: { id },
      data: body
    })
    
    return successResponse(item)
  } catch (error) {
    return handlePrismaError(error)
  }
})

// DELETE /api/resource/[id]
export const DELETE = withAuth(async (request, context, user) => {
  try {
    const id = parseInt(context.params.id)
    
    await prisma.resource.delete({
      where: { id }
    })
    
    return successResponse({ message: 'Deleted successfully' })
  } catch (error) {
    return handlePrismaError(error)
  }
})
```

### 5. Error Handling

Nutze `handlePrismaError` für Datenbank-Fehler:

```javascript
try {
  // Prisma operations
} catch (error) {
  return handlePrismaError(error)
}
```

### 6. Validierung

```javascript
import { validateRequired } from '@/lib/api.js'

const body = await request.json()

try {
  validateRequired(body, ['name', 'email'])
} catch (error) {
  return errorResponse(error.message, 400)
}
```

## Frontend Integration

### Fetch Example

```javascript
// GET Request
const response = await fetch('/api/strategies')
const { success, data } = await response.json()

if (success) {
  setStrategies(data)
}

// POST Request
const response = await fetch('/api/strategies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "My Strategy",
    shortCode: "MS_1D"
  })
})

const { success, data, message } = await response.json()

if (!success) {
  console.error(message)
}
```

### React Hook Example

```javascript
'use client'
import { useState, useEffect } from 'react'

export function useStrategies() {
  const [strategies, setStrategies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/strategies')
      .then(res => res.json())
      .then(({ success, data, message }) => {
        if (success) {
          setStrategies(data)
        } else {
          setError(message)
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { strategies, loading, error }
}
```

## Testing

Teste deine API-Routes mit curl:

```bash
# GET
curl http://localhost:3000/api/strategies

# POST
curl -X POST http://localhost:3000/api/strategies \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Strategy","shortCode":"TEST"}'

# PUT
curl -X PUT http://localhost:3000/api/strategies/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Strategy"}'

# DELETE
curl -X DELETE http://localhost:3000/api/strategies/1
```

## Nächste Schritte

1. Erstelle Prisma Models für Trades, Journal, etc.
2. Implementiere die API-Routes nach dem Template
3. Teste mit curl oder Postman
4. Integriere ins Frontend
5. Füge Middleware für zusätzliche Security hinzu (Rate Limiting, etc.)
