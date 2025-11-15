'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { GraduationCap, Briefcase, Building2, ArrowRight } from 'lucide-react';

export default function SignupSelectorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">InTime eSolutions</h1>
          <p className="text-lg text-gray-600">Choose your account type</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Student Signup */}
          <Link href="/signup/student" className="group">
            <Card className="h-full hover:shadow-xl transition-shadow border-2 hover:border-indigo-500 cursor-pointer">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition-colors">
                    <GraduationCap className="w-10 h-10 text-indigo-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">Student</CardTitle>
                <CardDescription className="text-sm">
                  Learn Guidewire from experts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Access to comprehensive Guidewire courses</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Interactive learning materials</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Track your progress</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Earn certifications</span>
                  </li>
                </ul>
                <div className="flex items-center text-indigo-600 font-medium group-hover:text-indigo-700">
                  <span>Get started</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Candidate Signup */}
          <Link href="/signup/candidate" className="group">
            <Card className="h-full hover:shadow-xl transition-shadow border-2 hover:border-green-500 cursor-pointer">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                    <Briefcase className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">Candidate</CardTitle>
                <CardDescription className="text-sm">
                  Find your dream job
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Browse Guidewire job opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Apply with one click</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Track your applications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Direct connection with recruiters</span>
                  </li>
                </ul>
                <div className="flex items-center text-green-600 font-medium group-hover:text-green-700">
                  <span>Get started</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Client Signup */}
          <Link href="/signup/client" className="group">
            <Card className="h-full hover:shadow-xl transition-shadow border-2 hover:border-purple-500 cursor-pointer">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                    <Building2 className="w-10 h-10 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-xl">Client</CardTitle>
                <CardDescription className="text-sm">
                  Hire top Guidewire talent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Access to vetted Guidewire professionals</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Post job opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Manage candidates pipeline</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Dedicated account support</span>
                  </li>
                </ul>
                <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700">
                  <span>Request access</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login/selector" className="font-medium text-indigo-600 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
