'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  LogOut,
  Home,
  Image,
  Target,
  Download,
  GraduationCap,
  BarChart3,
  BookOpen,
  Shield
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminSidebar() {
  const pathname = usePathname();
  const supabase = createClient();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
    { name: 'Talent', href: '/admin/talent', icon: Users },
    { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
    { name: 'Resources', href: '/admin/resources', icon: Download },
    { name: 'Banners', href: '/admin/banners', icon: Target },
    { name: 'Media Library', href: '/admin/media', icon: Image },
    { name: 'Courses', href: '/admin/courses', icon: GraduationCap },
    { name: 'Training Topics', href: '/admin/training-content/topics', icon: BookOpen },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Permissions', href: '/admin/permissions', icon: Shield },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <div className="w-64 bg-[#2B1F52] text-white flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Admin Portal
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 space-y-2 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Back to Website</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 w-full text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

