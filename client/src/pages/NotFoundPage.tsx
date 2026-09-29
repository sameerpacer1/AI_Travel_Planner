import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.js';
import { Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-800 mt-1">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        The destination you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          Return to Homepage
        </Button>
      </Link>
    </div>
  );
}
