'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { GraduationCap, Briefcase, Building2, Users, ArrowRight } from 'lucide-react';

export default function LoginSelectorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="relative">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">InTime eSolutions</h1>
            <p className="text-lg text-gray-600">Choose your account type to sign in</p>
          </div>
          <div className="absolute top-0 right-0 hidden md:block">
            <Link
              href="/employee/login"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Employee Login</span>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Student Login */}
          <Link href="/login/student" className="group">
            <Card className="h-full hover:shadow-xl transition-shadow border-2 hover:border-indigo-500 cursor-pointer">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
                    <GraduationCap className="w-10 h-10 text-indigo-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">Student</CardTitle>
                <CardDescription className="text-sm">
                  Sign in to your training account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Access your courses and progress</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Continue your learning journey</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Track achievements and certifications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Connect with your AI mentor</span>
                  </li>
                </ul>
                <div className="flex items-center text-indigo-600 font-medium group-hover:text-indigo-700">
                  <span>Sign in</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Candidate Login */}
          <Link href="/login/candidate" className="group">
            <Card className="h-full hover:shadow-xl transition-shadow border-2 hover:border-green-500 cursor-pointer">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <Briefcase className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">Candidate</CardTitle>
                <CardDescription className="text-sm">
                  Sign in to your job portal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>View your job applications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Browse new opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Update your profile</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Connect with recruiters</span>
                  </li>
                </ul>
                <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
                  <span>Sign in</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Client Login */}
          <Link href="/login/client" className="group">
            <Card className="h-full hover:shadow-xl transition-shadow border-2 hover:border-purple-500 cursor-pointer">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                    <Building2 className="w-10 h-10 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">Client</CardTitle>
                <CardDescription className="text-sm">
                  Sign in to your client portal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Access vetted talent pool</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Post job opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Manage candidate pipeline</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Get dedicated support</span>
                  </li>
                </ul>
                <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
                  <span>Sign in</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-600">
          <div>
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-indigo-600 hover:underline">
              Sign up
            </Link>
          </div>
          <div className="md:hidden">
            <Link
              href="/employee/login"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Employee Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

