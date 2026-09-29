# TripWise Architecture Documentation

## 1. System Topology & Request Flow

TripWise is engineered as a decoupled modern full-stack travel platform.

```
[ Browser / Mobile Client ]
         │
         │  HTTPS / REST JSON + HttpOnly SameSite Cookie
         ▼
[ Express.js REST API Server ]
    ├── Security Middlewares (Helmet, CORS, RateLimiter)
    ├── Authentication Middleware (JWT Validation, Session Injection)
    ├── Zod Request Validation Middleware
    └── Domain Controllers
         ├── AuthController
         ├── TripController (IDOR Enforcement)
         └── TravelController
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
[ Data Layer ]      [ External Service Abstractions ]
  • Prisma ORM        ├── Gemini AI Engine (Gemini 1.5 Flash)
  • PostgreSQL /      │     └── Strict JSON Mode + Zod Guardrails
    Neon Database     ├── OpenWeatherMap Service
                      │     └── Graceful Unconfigured Fallback
                      └── Google Maps Platform Service
                            └── Geocoding / Static Preview Fallback
```

---

## 2. Key Architectural Decisions & Rationale

### A. HttpOnly SameSite Cookie Authentication
- **Decision:** JWT authentication tokens are transmitted within `HttpOnly`, `SameSite=Lax` (or `Strict` in production), and `Secure` (production) cookies, rather than localStorage.
- **Rationale:** Storing tokens in browser `localStorage` or `sessionStorage` exposes sessions to Cross-Site Scripting (XSS) attacks. By setting `httpOnly: true`, JavaScript execution in the browser cannot read or exfiltrate the token.

### B. IDOR (Insecure Direct Object Reference) Protection
- **Decision:** Every trip data access query includes the authenticated `userId`.
- **Rationale:** Preventing attackers from incrementing or guessing trip UUIDs to view or mutate another user's itineraries:
  ```typescript
  // Enforced at database query level
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: req.user.id }
  });
  if (!trip) throw new NotFoundError('Trip not found or unauthorized');
  ```

### C. Gemini AI Proxy Architecture & Structured Output Guard
- **Decision:** The Gemini API key is kept exclusively on the server and is never exposed to the frontend.
- **Rationale:** Direct client-side calls would leak private API keys to any user inspecting browser devtools. Furthermore, the backend leverages Gemini's `responseMimeType: "application/json"` with schema instructions, and strictly validates all returned objects using `ItinerarySchema.safeParse()` prior to saving in the database.

### D. Zero Fake Data & Graceful Service Abstraction
- **Decision:** When external API keys (`GEMINI_API_KEY`, `GOOGLE_MAPS_API_KEY`, `WEATHER_API_KEY`) are not present in `.env`, the system presents transparent, typed unconfigured states instead of inventing fake prices, fake temperatures, or fake reviews.
- **Rationale:** In academic evaluations and production environments, deceptive fake data masks failure states and misleads users. Transparent states clearly document missing configuration and offer external fallback links without breaking app functionality.

---

## 3. Database Entity Relationship

```
+------------------------+             +----------------------------------+
|         users          |             |              trips               |
+------------------------+             +----------------------------------+
| id: String (UUID) [PK] | 1         * | id: String (UUID) [PK]           |
| name: String           |-------------| userId: String (UUID) [FK]       |
| email: String [UNIQUE] |             | title: String                    |
| passwordHash: String   |             | origin: String                   |
| emailVerified: Boolean |             | destination: String              |
| googleId: String?      |             | startDate: DateTime              |
| createdAt: DateTime    |             | endDate: DateTime                |
| updatedAt: DateTime    |             | travelers: Int                   |
+------------------------+             | budget: Float                    |
                                       | currency: String                 |
                                       | travelStyle: String              |
                                       | interests: String[]              |
                                       | transportPreference: String      |
                                       | accommodationPreference: String  |
                                       | additionalPreferences: String?   |
                                       | itinerary: Json?                 |
                                       | isGenerated: Boolean             |
                                       | createdAt: DateTime              |
                                       | updatedAt: DateTime              |
                                       +----------------------------------+
```
