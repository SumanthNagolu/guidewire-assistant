'use client';
import { signUpCandidate } from '@/modules/auth/actions';
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
import { Briefcase } from 'lucide-react';

export default function CandidateSignupPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await signUpCandidate(formData);
      if (result.success) {
        toast.success('Account created!');
        if (result.redirectTo) {
          window.location.href = result.redirectTo;
        }
      } else {
        toast.error(result.error || 'Failed to create account');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Briefcase className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Find Your Dream Job</CardTitle>
          <CardDescription>
            Create your candidate profile and start applying
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
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentTitle">Current Title (Optional)</Label>
              <Input
                id="currentTitle"
                name="currentTitle"
                placeholder="Senior Software Engineer"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience (Optional)</Label>
              <Input
                id="yearsOfExperience"
                name="yearsOfExperience"
                type="number"
                placeholder="5"
                min="0"
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Candidate Account'}
            </Button>
            <div className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login/candidate" className="text-green-600 hover:underline">
                Log in
              </Link>
            </div>
            <div className="text-sm text-center text-gray-600">
              Different signup type?{' '}
              <Link href="/signup" className="text-green-600 hover:underline">
                Choose signup type
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

