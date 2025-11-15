'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
export default function EmployeeLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      if (!data.user) {
        setError('Failed to sign in. Please try again.');
        setLoading(false);
        return;
      }
      // Get user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, first_name, last_name')
        .eq('id', data.user.id)
        .single();
      if (profileError || !profile) {
        setError('Unable to load user profile. Please contact support.');
        setLoading(false);
        return;
      }
      // Check if user is an employee (not a student)
      const employeeRoles = ['admin', 'recruiter', 'sales', 'account_manager', 'operations', 'employee'];
      if (!profile.role || !employeeRoles.includes(profile.role)) {
        // Student trying to access employee portal
        await supabase.auth.signOut();
        setError('Access denied. This portal is for InTime employees only. Students should use the Academy portal.');
        setLoading(false);
        return;
      }
      // Redirect based on role
      if (profile.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-blue-50 to-sky-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <div className="text-3xl font-heading font-bold text-trust-blue">
              InTime <span className="font-light">eSolutions</span>
            </div>
          </Link>
          <p className="text-wisdom-gray-600 mt-2 text-sm">Employee Portal</p>
        </div>
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-heading font-bold text-trust-blue-900">
              Welcome Back
            </h1>
            <p className="text-wisdom-gray-600 mt-1">
              Sign in to access your dashboard
            </p>
          </div>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@intimesolutions.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-wisdom-gray-600">Remember me</span>
              </label>
              <Link href="/employee/forgot-password" className="text-trust-blue hover:text-trust-blue-700">
                Forgot password?
              </Link>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-trust-blue hover:bg-trust-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-wisdom-gray-500">
              For support, contact IT at{' '}
              <a href="mailto:support@intimesolutions.com" className="text-trust-blue hover:underline">
                support@intimesolutions.com
              </a>
            </p>
          </div>
        </div>
        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-wisdom-gray-600 hover:text-trust-blue">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
