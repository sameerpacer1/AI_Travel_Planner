# TripWise REST API Specification

Base URL: `http://localhost:5000/api`

## Standard Envelope Formats

### Successful Response (HTTP 200/201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional descriptive status message"
}
```

### Error Response (HTTP 400/401/403/404/409/500/502/503)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | AI_SERVICE_ERROR | SERVICE_UNAVAILABLE",
    "message": "Human readable error message",
    "details": []
  }
}
```

---

## Authentication Endpoints

### 1. Register User
`POST /api/auth/register`

- **Request Body:**
  ```json
  {
    "name": "Maya Sharma",
    "email": "maya@example.com",
    "password": "Password123!"
  }
  ```
- **Response (201 Created):**
  - Sets HttpOnly cookie `tripwise_token`
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "uuid",
        "name": "Maya Sharma",
        "email": "maya@example.com",
        "emailVerified": false,
        "createdAt": "2026-09-29T18:00:00.000Z"
      },
      "token": "jwt-token-string"
    },
    "message": "Registration successful"
  }
  ```

### 2. Login User
`POST /api/auth/login`

- **Request Body:**
  ```json
  {
    "email": "maya@example.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK):**
  - Sets HttpOnly cookie `tripwise_token`

### 3. Logout
`POST /api/auth/logout`

- **Response (200 OK):**
  - Clears `tripwise_token` cookie

### 4. Get Current User Profile
`GET /api/auth/me`
- **Headers / Cookie:** `tripwise_token` cookie or `Authorization: Bearer <token>`
- **Response (200 OK):** Returns sanitized user object

### 5. Update Profile
`PUT /api/auth/profile`
- **Request Body:**
  ```json
  {
    "name": "Maya S.",
    "currentPassword": "Password123!",
    "newPassword": "NewPassword456!"
  }
  ```

---

## Trip Management Endpoints (All require authentication)

### 1. Create Trip Draft
`POST /api/trips`
- **Request Body:**
  ```json
  {
    "title": "Trip to Manali",
    "origin": "Ghaziabad",
    "destination": "Manali",
    "startDate": "2026-10-10",
    "endDate": "2026-10-13",
    "travelers": 3,
    "budget": 15000,
    "currency": "INR",
    "travelStyle": "budget",
    "interests": ["mountains", "photography", "food"],
    "transportPreference": "bus",
    "accommodationPreference": "budget_hotel",
    "additionalPreferences": "Vegetarian food"
  }
  ```
- **Response (201 Created):** Returns created trip object

### 2. List User Trips
`GET /api/trips`
- **Response (200 OK):** Returns array of trips owned by the authenticated user

### 3. Get Trip by ID
`GET /api/trips/:id`
- **Response (200 OK):** Returns trip object (or 404 if not found / belonging to another user)

### 4. Update Trip
`PUT /api/trips/:id`
- **Response (200 OK):** Returns updated trip object

### 5. Delete Trip
`DELETE /api/trips/:id`
- **Response (200 OK):** Deletes trip and its associated itinerary

---

## AI Generation Endpoints

### 1. Generate Itinerary
`POST /api/trips/:id/generate`
- Synthesizes structured itinerary via Gemini 1.5 Flash
- Validates output using Zod schema
- Stores validated JSON in database under `trip.itinerary`
- Returns trip + itinerary

### 2. Regenerate Itinerary with Directives
`POST /api/trips/:id/regenerate`
- **Request Body:**
  ```json
  {
    "modifier": "cheaper" | "more_nature" | "more_food" | "reduce_travel_time" | "more_relaxed" | "more_activities",
    "customPrompt": "Optional specific requirement"
  }
  ```
- Generates adjusted itinerary while preserving previous itinerary if generation fails

---

## Travel Service Abstraction Endpoints

### 1. Live Weather Forecast
`GET /api/weather?destination=Manali`
- Returns forecast data when `WEATHER_API_KEY` is present in `.env`
- Returns `{ configured: false, message: "..." }` when unconfigured

### 2. Geocode / Maps
`GET /api/geocode?query=Manali`
- Returns coordinates when `GOOGLE_MAPS_API_KEY` is present in `.env`
- Returns `{ configured: false, message: "..." }` when unconfigured

### 3. Service Status Health Check
`GET /api/services-status`
- Returns live configuration status for Gemini, Weather, and Google Maps
