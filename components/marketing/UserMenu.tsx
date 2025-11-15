"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { User, LogOut, LayoutDashboard, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function UserMenu() {
  type UserProfile = {
    role: string | null;
    full_name: string | null;
  };

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async (targetUser: SupabaseUser | null) => {
      if (!isMounted) return;

      setUser(targetUser);

      if (!targetUser) {
        setProfile(null);
        return;
      }

      const { data } = await supabase
        .from("user_profiles")
        .select("role, full_name")
        .eq("id", targetUser.id)
        .single();

      if (isMounted) {
        setProfile((data as UserProfile | null) ?? null);
      }
    };

    supabase.auth.getUser().then(({ data: { user } }) => {
      void fetchProfile(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void fetchProfile(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (!user) {
    return (
      <Link
        href="/login/selector"
        className="flex items-center gap-2 text-trust-blue hover:text-success-green font-bold transition-colors"
      >
        <User className="w-5 h-5" />
        <span className="hidden md:inline">Sign In</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <div className="h-9 w-9 rounded-full bg-trust-blue text-white flex items-center justify-center font-semibold">
          {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-trust-blue">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-wisdom-gray-600 truncate">{user.email}</p>
              {profile?.role && (
                <span className="inline-block mt-1 text-xs bg-trust-blue-50 text-trust-blue-700 px-2 py-1 rounded-full">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Admin Portal Link - Only for admins */}
              {profile?.role === 'admin' && (
                <>
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Portal
                  </Link>
                  <div className="border-t border-gray-200 my-2"></div>
                </>
              )}

              {/* Student Dashboard - For students */}
              {profile?.role === 'student' && (
                <Link
                  href="/academy"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  My Dashboard
                </Link>
              )}

              {/* Employee Portal - For employees */}
              {(profile?.role === 'employee' || profile?.role === 'admin') && (
                <Link
                  href="/employee/dashboard"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Users className="w-4 h-4" />
                  Employee Portal
                </Link>
              )}

              {/* My Profile */}
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>

              <div className="border-t border-gray-200 my-2"></div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

