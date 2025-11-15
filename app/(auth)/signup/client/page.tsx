'use client';
import { signUpClient } from '@/modules/auth/actions';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { Building2 } from 'lucide-react';

export default function ClientSignupPage() {
  const [loading, setLoading] = useState(false);
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Add select values to formData
    if (industry) formData.set('industry', industry);
    if (companySize) formData.set('companySize', companySize);
    
    setLoading(true);
    try {
      const result = await signUpClient(formData);
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Find Top Talent</CardTitle>
          <CardDescription>
            Register your company to access our talent pool
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Acme Corporation"
                required
                disabled={loading}
              />
            </div>
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
              <Label htmlFor="email">Work Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@acmecorp.com"
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
              <Label htmlFor="industry">Industry (Optional)</Label>
              <Select value={industry} onValueChange={setIndustry} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="financial-services">Financial Services</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size (Optional)</Label>
              <Select value={companySize} onValueChange={setCompanySize} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501-1000">501-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Request Client Account'}
            </Button>
            <p className="text-xs text-center text-gray-500">
              Your account will be reviewed and approved within 24 hours
            </p>
            <div className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/login/client" className="text-purple-600 hover:underline">
                Log in
              </Link>
            </div>
            <div className="text-sm text-center text-gray-600">
              Different signup type?{' '}
              <Link href="/signup" className="text-purple-600 hover:underline">
                Choose signup type
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

