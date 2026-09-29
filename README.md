# TripWise — AI-Powered Personalized Travel Planner

> A production-grade, full-stack travel planner web application that generates realistic, budget-aware, and explainable day-by-day itineraries using Google Gemini AI.

---

## 🌟 Key Highlights & Philosophy

Unlike generic AI travel templates that dump unstructured bullet points or invent fake prices, **TripWise** delivers:
- **Transparent AI Reasoning (XAI):** Every single activity contains an explicit explanation stating *why* it was selected based on the user's specific interests, travel style, and budget constraints.
- **Strict Budget Calibration:** Realistic cost partitioning across transport, accommodation, food, activities, and miscellaneous expenses within the user's budget ceiling.
- **Zero Fake Features Policy:** External services (Google Maps, OpenWeatherMap, Gemini AI) feature graceful, transparent service abstractions. If an API key is not yet configured, the system provides an informative configuration state rather than returning fake reviews, fabricated temperatures, or mock airline prices.
- **Privacy-First Architecture:** No unnecessary invasive data (PAN, Aadhaar, bank records, or permanent GPS location) is collected or stored. Passwords and session tokens are **never** transmitted to the AI engine.
- **Enterprise-Grade Security:** HttpOnly SameSite cookies (XSS protection), bcrypt password hashing (12 rounds), strict IDOR ownership checks on all trip resources, rate limiting, and Helmet headers.

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript (Strict mode)
- **Bundler:** Vite
- **Styling:** Tailwind CSS & Lucide React
- **Design System:** Custom accessible components (Buttons, Inputs, Cards, Badges, Modals, Skeletons)
- **Routing:** React Router v7 with protected routes & session restoration
- **Form & Validation:** React Hook Form + Zod resolvers
- **Data Fetching:** TanStack Query + Axios instance with credentials

### Backend
- **Runtime:** Node.js (v20+ / v24 compatible)
- **Server:** Express.js with TypeScript
- **Database ORM:** Prisma ORM (v6)
- **Database:** PostgreSQL (Neon PostgreSQL compatible) + Automatic resilient fallback store for offline testing
- **Authentication:** JWT in HttpOnly cookies with bcryptjs password hashing
- **Security:** Helmet, CORS, Express-Rate-Limit, Zod request body validation

### AI & External Integrations
- **AI Engine:** Google Gemini API (`gemini-1.5-flash`) with structured JSON schema enforcement
- **Weather Service:** OpenWeatherMap API abstraction with graceful unconfigured fallback
- **Maps Service:** Google Maps Platform geocoding abstraction with graceful fallback

---

## 🚀 Quick Start & Local Setup

### 1. Clone & Enter Project Directory
```bash
git clone <repository-url>
cd "AI Travel Planner"
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your configuration details:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/tripwise?schema=public"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secure-jwt-secret-min-32-chars
GEMINI_API_KEY=your-gemini-api-key
WEATHER_API_KEY=your-openweather-api-key       # (Optional)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key   # (Optional)
```
*(Note: If `DATABASE_URL` is omitted or PostgreSQL is not currently running locally, TripWise automatically activates its internal memory repository so you can immediately test all features without interruption!)*

### 3. Install Dependencies
```bash
# Install server dependencies
cd server
npm install
npx prisma generate --schema=../prisma/schema.prisma

# Install client dependencies
cd ../client
npm install
cd ..
```

### 4. Run the Development Servers
In two separate terminals:

**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```
Backend will start on `http://localhost:5000`.

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## 🧪 Testing & Verification

TripWise includes a comprehensive automated test suite testing Authentication, Authorization, IDOR Protection, and AI Schema Validation:

```bash
cd server
npm test
```

### Tests Covered:
- **Authentication:** Registration, unique email constraints, password hashing, HttpOnly cookie generation, invalid credential rejection, session verification.
- **Authorization & IDOR Protection:** Proves that User A cannot view, update, or delete User B's trips under any circumstances (404/Forbidden).
- **Date & Constraint Validation:** Rejects trips where end date precedes start date or passenger count is invalid.
- **AI Schema Guardrails:** Verifies that AI responses missing the mandatory "reason" or cost partitions are rejected.

---

## 🛡️ Privacy & Security Features

| Threat | Mitigation Architecture |
|---|---|
| **XSS Token Theft** | JWTs are stored exclusively in `HttpOnly`, `SameSite=Lax` cookies; inaccessible via JavaScript `document.cookie`. |
| **IDOR (Insecure Direct Object Reference)** | Every database query requires both `id` AND `userId: req.user.id`. |
| **AI Privacy Leak** | Zero user credentials or identity tokens are transmitted to Gemini AI. Only trip requirements are forwarded. |
| **Brute Force & DoS** | `express-rate-limit` enforces rate limiting on all requests and auth endpoints. |
| **Credential Storage** | Passwords are salted and hashed using `bcrypt` (12 rounds). Plaintext passwords are never logged or stored. |
| **Data Integrity** | Zod validates every incoming request payload before controller execution. |

---

## 📋 Viva Presentation Guide (For Evaluators & Examiners)

When presenting TripWise in a college mini-project viva, highlight these four standout engineering points:

1. **Structured AI Output vs. Unstructured Chat:** Explain how TripWise requests structured JSON conforming to a strict Zod schema rather than unparsed prose, and validates every activity before writing to the database.
2. **Transparent Reasoning (Explainable AI):** Show how each activity explains *why* it was chosen (e.g. *"Solang Valley was chosen because you selected mountains and photography, fitting into your Day 2 afternoon budget"*).
3. **Defense-in-Depth Security:** Emphasize that tokens are not stored in `localStorage`, eliminating XSS token theft, and point out the IDOR test suite demonstrating multi-tenant isolation.
4. **Resilient Service Abstractions:** Demonstrate that when an API key is missing, the application handles it gracefully without inventing fake data or throwing uncaught 500 errors.

---

## 📂 Project Structure

```
AI Travel Planner/
├── client/                     # Frontend Vite + React + TypeScript App
│   ├── src/
│   │   ├── components/ui/      # Reusable UI (Button, Input, Card, Modal, Badge, Skeleton)
│   │   ├── features/           # AuthContext, MapWidget, WeatherWidget
│   │   ├── layouts/            # Navbar, Footer, MainLayout, ProtectedRoute
│   │   ├── pages/              # LandingPage, DashboardPage, CreateTripPage, TripDetailPage, ProfilePage
│   │   ├── lib/                # Axios instance, formatting utilities
│   │   └── types/              # TypeScript domain types
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend Express + TypeScript REST API
│   ├── src/
│   │   ├── config/             # Environment validation with Zod
│   │   ├── controllers/        # AuthController, TripController, TravelController
│   │   ├── middleware/         # requireAuth, validateRequest, errorHandler
│   │   ├── routes/             # auth.routes, trip.routes, travel.routes
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # GeminiService, WeatherService, MapsService, DbService
│   │   ├── app.ts              # Express configuration, Helmet, CORS, RateLimiting
│   │   └── server.ts           # Server bootstrap
│   ├── tests/                  # Automated integration tests (Vitest + Supertest)
│   └── package.json
│
├── prisma/
│   └── schema.prisma           # Relational schema for PostgreSQL / Neon
├── docs/
│   ├── architecture.md         # Detailed architectural breakdown
│   └── api.md                  # REST API contract
├── .env.example                # Configuration template
└── README.md                   # Project documentation
```

---

## 📄 License
MIT License. Built for academic demonstration and modern travel planning.
