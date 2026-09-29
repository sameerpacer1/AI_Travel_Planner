import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Footer } from './Footer.js';

export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
