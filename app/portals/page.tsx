import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, GraduationCap, Users, Settings, ArrowRight } from 'lucide-react';
import Link from 'next/link';
export const metadata: Metadata = {
  title: 'Portals | IntimeSolutions',
  description: 'Access your portals',
};
const portals = [
  {
    name: 'HR Portal',
    description: 'Manage employees, timesheets, leave, expenses, and more',
    icon: Users,
    href: '/hr/dashboard',
    color: 'bg-indigo-500',
    features: [
      'Employee Management',
      'Time & Attendance',
      'Leave Management',
      'Expense Claims',
      'Document Generation',
      'HR Analytics',
    ],
  },
  {
    name: 'Learning Portal',
    description: 'Access Guidewire training courses and certifications',
    icon: GraduationCap,
    href: '/academy',
    color: 'bg-blue-500',
    features: [
      'Online Courses',
      'Video Tutorials',
      'Practice Labs',
      'Certifications',
      'Progress Tracking',
      'AI Mentor',
    ],
  },
  {
    name: 'Admin Portal',
    description: 'System administration and configuration',
    icon: Settings,
    href: '/admin/dashboard',
    color: 'bg-purple-500',
    features: [
      'User Management',
      'System Settings',
      'Security & Permissions',
      'Database Management',
      'Audit Logs',
      'System Health',
    ],
  },
];
export default async function PortalsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Building className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            IntimeSolutions Portals
          </h1>
          <p className="text-xl text-gray-600">
            {user ? `Welcome back! Choose a portal to continue.` : 'Choose a portal to get started'}
          </p>
        </div>
        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Card key={portal.name} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 ${portal.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{portal.name}</CardTitle>
                  <CardDescription>{portal.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {portal.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm text-gray-600">
                        <ArrowRight className="h-4 w-4 mr-2 text-gray-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full">
                    <Link href={portal.href}>
                      Access {portal.name}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-700">
              Main Website →
            </Link>
            <Link href="/hr/login" className="text-sm text-indigo-600 hover:text-indigo-700">
              HR Login →
            </Link>
            <Link href="/academy/login" className="text-sm text-indigo-600 hover:text-indigo-700">
              Learning Login →
            </Link>
            <Link href="/admin/login" className="text-sm text-indigo-600 hover:text-indigo-700">
              Admin Login →
            </Link>
          </div>
        </div>
        {/* Footer */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>© 2025 IntimeSolutions. All rights reserved.</p>
          <p className="mt-2">
            Need help?{' '}
            <Link href="/support" className="text-indigo-600 hover:text-indigo-700">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
