'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building, Lock, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';
export default function HRLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        return;
      }
      if (data.user) {
        // Check if user has an employee record
        const { data: employee, error: empError } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', data.user.id)
          .single();
        if (empError || !employee) {
          // If no employee record, create one with basic details
          const { error: createError } = await supabase
            .from('employees')
            .insert({
              user_id: data.user.id,
              email: data.user.email,
              employee_id: `EMP${Date.now()}`, // Temporary ID
              first_name: data.user.email?.split('@')[0] || 'User',
              last_name: 'Account',
              hire_date: new Date().toISOString(),
              employment_status: 'Active',
              role_id: null, // Will be assigned by HR
            });
          if (createError) {
            }
        }
        router.push('/hr/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      } finally {
      setLoading(false);
    }
  };
  const handleDemoLogin = async () => {
    // Use demo credentials
    setEmail('demo@intimesolutions.com');
    setPassword('demo123456');
    // Auto-submit the form
    setTimeout(() => {
      document.getElementById('login-form')?.requestSubmit();
    }, 100);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white rounded-full shadow-lg">
              <Building className="h-12 w-12 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">HR Portal</h1>
          <p className="text-gray-600 mt-2">IntimeSolutions HR Management System</p>
        </div>
        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to access your HR dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form id="login-form" onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  href="/hr/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDemoLogin}
              >
                Login with Demo Account
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/hr/register"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Contact HR Admin
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          © 2025 IntimeSolutions. All rights reserved.
        </p>
      </div>
    </div>
  );
}
