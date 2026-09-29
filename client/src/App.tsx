import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout.js';
import { ProtectedRoute } from './layouts/ProtectedRoute.js';

import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { CreateTripPage } from './pages/CreateTripPage.js';
import { TripDetailPage } from './pages/TripDetailPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

export function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/trips/new" element={<CreateTripPage />} />
          <Route path="/trips/:id" element={<TripDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
