'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Shield } from 'lucide-react';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/admin';
  
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof LoginForm, string>>>({});
  const [globalError, setGlobalError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Validate individual field
  const validateField = (name: keyof LoginForm, value: string) => {
    try {
      loginSchema.shape[name].parse(value);
      setErrors(prev => ({ ...prev, [name]: undefined }));
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [name]: err.errors[0].message }));
        return false;
      }
      return false;
    }
  };
  
  // Handle field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name as keyof LoginForm]) {
      setErrors(prev => ({ ...prev, [name as keyof LoginForm]: undefined }));
    }
    if (globalError) {
      setGlobalError('');
    }
  };
  
  // Handle field blur (validate on blur)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name as keyof LoginForm, value);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    
    // Validate all fields
    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof LoginForm, string>> = {};
      validation.error.issues.forEach(issue => {
        const field = issue.path[0] as keyof LoginForm;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      // Attempt login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) {
        // Handle specific error types
        if (error.message.includes('Invalid') || error.message.includes('credentials')) {
          setGlobalError('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setGlobalError('Please verify your email address before logging in.');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          setGlobalError('Connection failed. Please check your internet and try again.');
        } else {
          setGlobalError('Authentication failed. Please try again.');
        }
        return;
      }
      
      // Verify user is admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, first_name, last_name')
        .eq('id', data.user.id)
        .single();
      
      if (profile?.role !== 'admin') {
        // Not an admin - sign them out and show error
        await supabase.auth.signOut();
        setGlobalError('Admin access required. This account does not have administrator privileges.');
        return;
      }
      
      // Success - redirect to intended destination
      const safeRedirect = redirectTo.startsWith('/admin') ? redirectTo : '/admin';
      router.push(safeRedirect);
      router.refresh();
      
    } catch (err) {
      console.error('[Admin Login Error]', err);
      setGlobalError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Form is valid when both fields pass validation
  const isFormValid = formData.email && formData.password && !errors.email && !errors.password;
  
  return (
    <Card className="border-0 shadow-2xl">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the admin portal
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Global Error Alert */}
          {globalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{globalError}</AlertDescription>
            </Alert>
          )}
          
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={errors.email ? 'border-red-500 focus:ring-red-500' : ''}
              required
              autoFocus
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          
          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="/reset-password"
                className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
                tabIndex={-1}
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={errors.password ? 'border-red-500 focus:ring-red-500' : ''}
              required
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
        
        {/* Additional Help */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Not an administrator?{' '}
            <a href="/login" className="text-purple-600 hover:text-purple-800 font-medium">
              Sign in as user
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

