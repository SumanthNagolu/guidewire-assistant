'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Briefcase, Send, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface RecruiterDashboardProps {
  user: any;
  profile: any;
}

interface DashboardMetrics {
  activeCandidates: number;
  openJobs: number;
  activeApplications: number;
  interviewsThisWeek: number;
  placementsThisMonth: number;
}

export default function RecruiterDashboard({ user, profile }: RecruiterDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeCandidates: 0,
    openJobs: 0,
    activeApplications: 0,
    interviewsThisWeek: 0,
    placementsThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient() as any; // Type cast for CRM tables

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      // This is placeholder - actual queries will come from Supabase
      // For now, showing static demo data
      setMetrics({
        activeCandidates: 47,
        openJobs: 12,
        activeApplications: 64,
        interviewsThisWeek: 8,
        placementsThisMonth: 3,
      });
      setLoading(false);
    } catch (error) {
            setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Active Candidates',
      value: metrics.activeCandidates,
      icon: Users,
      color: 'bg-trust-blue-100 text-trust-blue-600',
      href: '/employee/candidates',
    },
    {
      label: 'Open Jobs',
      value: metrics.openJobs,
      icon: Briefcase,
      color: 'bg-success-green-100 text-success-green-600',
      href: '/employee/jobs',
    },
    {
      label: 'Active Applications',
      value: metrics.activeApplications,
      icon: Send,
      color: 'bg-innovation-orange-100 text-innovation-orange-600',
      href: '/employee/applications',
    },
    {
      label: 'Interviews This Week',
      value: metrics.interviewsThisWeek,
      icon: Calendar,
      color: 'bg-sky-blue-100 text-sky-blue-600',
      href: '/employee/interviews',
    },
    {
      label: 'Placements This Month',
      value: metrics.placementsThisMonth,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
      href: '/employee/placements',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-trust-blue-900">
                Welcome back, {profile.full_name}!
              </h1>
              <p className="text-wisdom-gray-600 mt-1">
                Here's your recruitment dashboard for today
              </p>
            </div>
            <Link
              href="/employee/candidates/new"
              className="btn-primary"
            >
              + Add Candidate
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-heading font-bold text-trust-blue-900 mb-1">
                {loading ? '...' : stat.value}
              </div>
              <div className="text-sm text-wisdom-gray-600">{stat.label}</div>
            </Link>
          ))}
        </div>

        {/* Quick Actions & Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/employee/candidates/search"
                className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                <div className="font-medium text-trust-blue">Search Candidates</div>
                <div className="text-sm text-wisdom-gray-600">Find candidates by skills</div>
              </Link>
              <Link
                href="/employee/jobs"
                className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                <div className="font-medium text-trust-blue">View Open Jobs</div>
                <div className="text-sm text-wisdom-gray-600">See all active requisitions</div>
              </Link>
              <Link
                href="/employee/pipeline"
                className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
              >
                <div className="font-medium text-trust-blue">Pipeline Board</div>
                <div className="text-sm text-wisdom-gray-600">Manage your applications</div>
              </Link>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
              Today's Schedule
            </h2>
            <div className="space-y-4">
              {/* Placeholder interviews */}
              <div className="flex items-start gap-4 p-4 rounded-lg bg-trust-blue-50 border border-trust-blue-200">
                <div className="flex-shrink-0 w-16 text-center">
                  <div className="text-sm font-medium text-trust-blue-600">10:00 AM</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-trust-blue-900">Phone Screen - Rajesh Kumar</div>
                  <div className="text-sm text-wisdom-gray-600">Senior Guidewire Developer @ BigCorp</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-4 rounded-lg bg-sky-blue-50 border border-sky-blue-200">
                <div className="flex-shrink-0 w-16 text-center">
                  <div className="text-sm font-medium text-sky-blue-600">2:00 PM</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-trust-blue-900">Client Interview - Sarah Johnson</div>
                  <div className="text-sm text-wisdom-gray-600">Full Stack Developer @ HealthTech</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-success-green-50 border border-success-green-200">
                <div className="flex-shrink-0 w-16 text-center">
                  <div className="text-sm font-medium text-success-green-600">4:00 PM</div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-trust-blue-900">Technical Round - Michael Chen</div>
                  <div className="text-sm text-wisdom-gray-600">Guidewire Architect @ Insurance Co</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/employee/calendar" className="text-trust-blue hover:text-trust-blue-700 text-sm font-medium">
                View Full Calendar →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity & Pipeline Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-success-green-500 mt-2"></div>
                <div>
                  <div className="text-sm font-medium text-trust-blue-900">Candidate submitted to BigCorp</div>
                  <div className="text-xs text-wisdom-gray-500">Rajesh Kumar • 2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-trust-blue-500 mt-2"></div>
                <div>
                  <div className="text-sm font-medium text-trust-blue-900">Interview scheduled</div>
                  <div className="text-xs text-wisdom-gray-500">Sarah Johnson • 3 hours ago</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-innovation-orange-500 mt-2"></div>
                <div>
                  <div className="text-sm font-medium text-trust-blue-900">New job requisition</div>
                  <div className="text-xs text-wisdom-gray-500">Guidewire PolicyCenter Lead • 4 hours ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
              Pipeline Summary
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-wisdom-gray-600">Sourced</span>
                <span className="text-sm font-medium text-trust-blue-900">12 candidates</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-wisdom-gray-600">Screening</span>
                <span className="text-sm font-medium text-trust-blue-900">8 candidates</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-wisdom-gray-600">Submitted</span>
                <span className="text-sm font-medium text-trust-blue-900">15 candidates</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-wisdom-gray-600">Interviewing</span>
                <span className="text-sm font-medium text-trust-blue-900">10 candidates</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-wisdom-gray-600">Offer Stage</span>
                <span className="text-sm font-medium text-success-green-600 font-semibold">2 candidates</span>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/employee/pipeline" className="text-trust-blue hover:text-trust-blue-700 text-sm font-medium">
                View Full Pipeline →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

