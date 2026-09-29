import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../features/auth/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { Compass, User, Mail, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { getErrorMessage } from '../lib/api.js';

const registerFormSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

export function RegisterPage() {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError(null);
      await registerAuth(data.name, data.email, data.password);
      navigate('/dashboard');
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
          <p className="text-xs text-slate-500 mt-1">Join TripWise to plan personalized AI itineraries</p>
        </div>

        <Card className="shadow-float border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sign Up</CardTitle>
            <CardDescription>Enter your details below to get started</CardDescription>
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
                label="Full Name"
                placeholder="e.g. Maya Sharma"
                startIcon={<User className="w-4 h-4" />}
                error={errors.name?.message}
                {...register('name')}
              />

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
                placeholder="At least 8 chars, 1 uppercase & 1 number"
                startIcon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                startIcon={<Lock className="w-4 h-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your password is securely hashed with bcrypt. We never store plain text.</span>
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                size="md"
                isLoading={isSubmitting}
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
