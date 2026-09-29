import { useState } from 'react';
import { useAuth } from '../features/auth/AuthContext.js';
import { api, getErrorMessage } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { User, Mail, Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate } from '../lib/utils.js';

export function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsUpdatingProfile(true);
      setProfileMessage(null);
      setProfileError(null);

      const res = await api.put('/auth/profile', { name });
      if (res.data.success) {
        setProfileMessage('Name updated successfully');
        await refreshUser();
      }
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setProfileError('New passwords do not match');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      setProfileMessage(null);
      setProfileError(null);

      const res = await api.put('/auth/profile', {
        currentPassword,
        newPassword,
      });

      if (res.data.success) {
        setProfileMessage('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account & Security</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your account profile and password credentials</p>
      </div>

      {profileMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{profileMessage}</span>
        </div>
      )}

      {profileError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{profileError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card className="border-slate-200/80 shadow-subtle">
          <CardHeader>
            <CardTitle className="text-base">Profile Information</CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                startIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                startIcon={<Mail className="w-4 h-4" />}
                helperText="Email address cannot be changed directly"
              />

              <div className="text-[11px] text-slate-400">
                Member since {user?.createdAt ? formatDate(user.createdAt) : 'Recently'}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isUpdatingProfile}
              >
                Save Name
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-slate-200/80 shadow-subtle">
          <CardHeader>
            <CardTitle className="text-base">Change Password</CardTitle>
            <CardDescription>Keep your account secure with a strong password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                startIcon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="At least 8 chars, 1 uppercase & 1 number"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                startIcon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                startIcon={<Lock className="w-4 h-4" />}
              />

              <Button
                type="submit"
                variant="outline"
                size="sm"
                isLoading={isUpdatingProfile}
              >
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Security Architecture & Privacy Guarantee */}
      <Card className="border-slate-200/80 shadow-subtle bg-slate-50">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>TripWise Security Architecture</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your credentials are protected with <strong>bcrypt (12 rounds)</strong>. Sessions are managed through <strong>HttpOnly and SameSite protected cookies</strong>, which cannot be accessed by browser scripts. Your trip data is strictly tied to your account with IDOR ownership validation on every request.
          </p>
          <div className="pt-2">
            <Button
              variant="danger"
              size="sm"
              onClick={logout}
            >
              Sign out of TripWise
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
