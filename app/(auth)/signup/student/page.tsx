'use client';
import { signUpStudent } from '@/modules/auth/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { GraduationCap } from 'lucide-react';

export default function StudentSignupPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await signUpStudent(formData);
      if (result.success) {
        // Redirect to confirmation page with email parameter
        const email = formData.get('email') as string;
        const redirectUrl = result.redirectTo 
          ? `${result.redirectTo}?email=${encodeURIComponent(email)}`
          : `/signup/student/confirmation?email=${encodeURIComponent(email)}`;
        window.location.href = redirectUrl;
      } else {
        toast.error(result.error || 'Failed to create account');
        setLoading(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Join the Academy</CardTitle>
          <CardDescription>
            Start your Guidewire learning journey today
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={8}
              />
              <p className="text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL (Optional)</Label>
              <Input
                id="linkedin"
                name="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Student Account'}
            </Button>
            <div className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login/student" className="text-indigo-600 hover:underline">
                Log in
              </Link>
            </div>
            <div className="text-sm text-center text-gray-600">
              Different signup type?{' '}
              <Link href="/signup" className="text-indigo-600 hover:underline">
                Choose signup type
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

