# TripWise — AI-Powered Personalized Travel Planner

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A production-grade, full-stack travel planner web application that generates realistic, budget-aware, explainable day-by-day itineraries and manages customer travel inquiries using **Google Gemini AI** and **Supabase PostgreSQL**. Fully responsive across smartphones, tablets, and laptops.

---

## 🌟 Key Highlights & Philosophy

Unlike generic AI travel templates that dump unstructured bullet points or invent fake prices, **TripWise** delivers:
- **Transparent AI Reasoning (Explainable AI - XAI):** Every single activity in an itinerary contains an explicit explanation stating *why* it was selected based on the user's specific interests, travel style, and budget constraints.
- **Strict Budget Calibration:** Realistic cost partitioning across transport, accommodation, food, activities, and miscellaneous expenses within the user's budget ceiling in INR (`₹`) or foreign currencies.
- **Authentic Local Photography & Curated Visited Places:** Zero mismatched imagery. Vetted local photography for top Indian travel destinations (Varanasi, Manali, Jaipur, Mumbai, Kerala, Goa, Agra, Delhi, Rishikesh, Amritsar, Udaipur) with highlighted sights and estimated costs.
- **Interactive Multi-Modal Route Calculation:** Dynamic distance and journey duration estimates between origin and destination across multiple transit modes (Volvo Bus, Train, Flight, Self-Drive Car).
- **Customer Consultation & Inquiry Engine:** Integrated inquiry submission form for travelers seeking personalized consultation, saving directly to Supabase cloud PostgreSQL.
- **Zero Fake Features Policy:** External services (Google Maps, OpenWeatherMap, Gemini AI) feature graceful, transparent service abstractions. If an API key is not yet configured, the system provides an informative configuration state rather than returning fake reviews, fabricated temperatures, or mock airline prices.
- **100% Cross-Device Compatibility:** Custom mobile navigation drawer, thumb-friendly tap targets (`min-h-[44px]`), modal scroll containment, and network hosting (`--host`) for live mobile device testing.
- **Privacy & Security First:** 
  - API keys and secrets are protected on the backend; the client bundle contains **zero private keys**.
  - Customer inquiry data is protected behind authenticated endpoints (`requireAuth`).
  - Passwords hashed using `bcrypt` (12 rounds) with `HttpOnly` `SameSite=Lax` JWT session cookies (no `localStorage` XSS exposure).
  - Automated regex error sanitization prevents database credentials from leaking in server logs or responses.

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript (Strict mode)
- **Bundler:** Vite 6 with local network IP sharing (`--host`)
- **Styling:** Tailwind CSS & Lucide React
- **Design System:** Accessible UI components (Buttons, Inputs, Cards, Badges, Modals, Skeletons)
- **Routing:** React Router v7 with protected routes & session restoration
- **Form & Validation:** React Hook Form + Zod resolvers
- **Data Fetching:** TanStack Query + Axios instance with credentials

### Backend
- **Runtime:** Node.js (v20+ / v24 compatible)
- **Server:** Express.js with TypeScript
- **Database ORM:** Prisma ORM (v6)
- **Database:** Supabase PostgreSQL (IPv4 Session Pooler) + Resilient in-memory fallback store for offline development
- **Authentication:** JWT in HttpOnly cookies with bcryptjs password hashing
- **Security:** Helmet, CORS, Express-Rate-Limit, Zod request body validation

### AI & External Integrations
- **AI Engine:** Google Gemini API (`gemini-1.5-flash`) with structured JSON schema enforcement
- **Weather Service:** OpenWeatherMap API abstraction with graceful unconfigured fallback
- **Maps & Geocoding:** Google Maps Platform / OpenStreetMap abstraction with coordinate validation

---

## 🚀 Quick Start & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/sameerpacer1/AI_Travel_Planner.git
cd AI_Travel_Planner
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root and `server/` directory:
```bash
cp .env.example .env
```
Fill in your configuration details:
```env
# Database (Supabase PostgreSQL / Neon compatible)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require"

# Supabase API Credentials (Optional - for direct Supabase API client usage)
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Backend Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Authentication Security
JWT_SECRET=super-secret-jwt-key-change-in-production-min-32-chars

# Google AI (Gemini)
GEMINI_API_KEY=your-gemini-api-key

# External Services (Optional)
WEATHER_API_KEY=your-openweather-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```
*(Note: If `DATABASE_URL` is omitted or temporarily unreachable, TripWise automatically activates its internal memory repository so you can immediately test all features without interruption!)*

### 3. Install Dependencies
```bash
npm install
npm --prefix server install
npm --prefix client install
npx prisma generate
```

### 4. Run the Application
You can run both Frontend and Backend concurrently with a single command:
```bash
npm run dev
```

* **Frontend (Laptop Browser):** `http://localhost:5173`
* **Frontend (Mobile Phone on Wi-Fi):** `http://<YOUR-LOCAL-IP>:5173` (e.g. `http://192.168.1.100:5173`)
* **Backend API Health Check:** `http://localhost:5000/api/health`

*(On Windows, you can also simply double-click `start-tripwise.bat` to launch everything automatically!)*

---

## 🧪 Automated Testing & Verification

TripWise includes an extensive automated test suite with **22 integration test cases** covering Authentication, Authorization, IDOR Protection, Inquiry Security, and AI Schema Validation:

```bash
npm test
```

### Test Coverage Highlights:
- **Authentication:** User registration, unique email constraints, password hashing, HttpOnly cookie generation, invalid credential rejection, session verification.
- **Authorization & IDOR Protection:** Guarantees that User A cannot view, update, or delete User B's trips under any circumstances (404/Forbidden).
- **Inquiry Security:** Confirms that public visitors can submit inquiries, but unauthenticated users cannot list or scrape customer contact data (401 Unauthorized).
- **Date & Constraint Validation:** Rejects trips where end date precedes start date or passenger count is invalid.
- **AI Schema Guardrails:** Verifies that AI responses missing the mandatory "reason" or cost partitions are caught and handled gracefully.

---

## 🛡️ Security & Privacy Engineering

| Threat / Risk | Engineering Defense |
|---|---|
| **XSS Token Theft** | JWTs are stored exclusively in `HttpOnly`, `SameSite=Lax` cookies; completely inaccessible to JavaScript `document.cookie`. |
| **IDOR (Insecure Direct Object Reference)** | Every database query requires both `id` AND `userId: req.user.id`. |
| **Public Customer Data Scraping** | `GET /api/inquiries` is gated behind `requireAuth`. |
| **API Key Leakage** | All third-party calls (Gemini, Supabase, Maps, Weather) are mediated by the backend server; frontend contains zero private secrets. |
| **Log / Error Credentials Leak** | Automated regex sanitization in error middleware strips database passwords and auth tokens before returning responses. |
| **Brute Force & DoS** | `express-rate-limit` enforces strict request throttling on auth and submission endpoints. |
| **Password Storage** | Passwords are salted and hashed using `bcrypt` (12 rounds). Plaintext passwords are never logged or stored. |

---

## 📱 Mobile & Laptop Usability

- **Responsive Viewport:** Built with mobile-first Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`).
- **Mobile Drawer Navigation:** Accessible hamburger menu with touch-friendly tap targets (`min-h-[44px]`).
- **Touch-Friendly Controls:** Sized input fields, date pickers, budget sliders, and full-width mobile action buttons.
- **Safe Scroll Containment:** `overflow-x: hidden` and smooth scrolling prevent accidental horizontal layout shifts on phones.
- **Adaptive Modal System:** Modals contain `max-h-[90vh] overflow-y-auto` so buttons and form fields are never cut off on small screens.

---

## 📂 Project Structure

```
AI Travel Planner/
├── client/                     # Frontend Vite + React + TypeScript App
│   ├── src/
│   │   ├── components/ui/      # Reusable UI (Button, Input, Card, Modal, Badge, Skeleton)
│   │   ├── features/           # Auth, Inquiry, MapWidget, Places, Route, Weather
│   │   ├── layouts/            # Navbar, Footer, MainLayout, ProtectedRoute
│   │   ├── pages/              # Landing, Dashboard, CreateTrip, TripDetail, Login, Register, Profile
│   │   ├── lib/                # API client, place image catalog, formatters
│   │   └── types/              # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend Express + TypeScript REST API
│   ├── src/
│   │   ├── config/             # Environment validation with Zod
│   │   ├── controllers/        # AuthController, TripController, TravelController
│   │   ├── middleware/         # requireAuth, validateRequest, errorHandler
│   │   ├── routes/             # auth.routes, inquiry.routes, trip.routes, travel.routes
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # GeminiService, WeatherService, MapsService, RouteService, DbService
│   │   ├── app.ts              # Express configuration, Helmet, CORS, RateLimiting
│   │   └── server.ts           # Server bootstrap
│   ├── tests/                  # Automated integration tests (Vitest + Supertest)
│   └── package.json
│
├── prisma/
│   └── schema.prisma           # Relational schema for Supabase PostgreSQL
├── docs/
│   ├── architecture.md         # Detailed architectural breakdown
│   └── api.md                  # REST API contract
├── start-tripwise.bat          # 1-Click Windows startup launcher
├── .env.example                # Safe environment template
├── .gitignore                  # Git privacy & secret protection rules
└── README.md                   # Project documentation
```

---

## 📄 License
MIT License. Built for modern AI travel planning and academic evaluation.
