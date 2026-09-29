import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../features/auth/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { Compass, Mail, Lock, AlertCircle } from 'lucide-react';
import { getErrorMessage } from '../lib/api.js';

const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-surface py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Trip<span className="text-brand-600">Wise</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="text-xs text-slate-500 mt-1">Sign in to manage and plan your trips</p>
        </div>

        <Card className="shadow-float border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sign In</CardTitle>
            <CardDescription>Enter your email and password to access your account</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {serverError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                startIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                startIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <Button
                type="submit"
                className="w-full mt-2"
                size="md"
                isLoading={isSubmitting}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Don't have an account yet?{' '}
                <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
