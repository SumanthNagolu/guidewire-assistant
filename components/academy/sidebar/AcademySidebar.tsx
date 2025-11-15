'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { 
  BookOpen, 
  Trophy, 
  Users, 
  BarChart3, 
  Settings, 
  Home,
  GraduationCap,
  Sparkles,
  HelpCircle
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/academy', icon: Home },
  { name: 'Topics', href: '/academy/topics', icon: BookOpen },
  { name: 'Achievements', href: '/academy/achievements', icon: Trophy },
  { name: 'Leaderboard', href: '/academy/leaderboard', icon: Users },
  { name: 'Progress', href: '/academy/progress', icon: BarChart3 },
  { name: 'AI Mentor', href: '/academy/ai-mentor', icon: Sparkles },
]

const bottomNavigation = [
  { name: 'Help', href: '/academy/help', icon: HelpCircle },
  { name: 'Settings', href: '/academy/settings', icon: Settings },
]

export function AcademySidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <GraduationCap className="h-8 w-8 text-primary-600 mr-2" />
        <span className="text-xl font-bold text-gray-900">Academy</span>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100',
                    isActive && 'bg-primary-50 text-primary-700 hover:bg-primary-50 hover:text-primary-700'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-1 h-6 bg-primary-600 rounded-full" />
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-gray-200">
        <nav className="space-y-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100',
                    isActive && 'bg-primary-50 text-primary-700'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
            SK
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Sarah Kim</p>
            <p className="text-xs text-gray-500">Level 7 • 2,450 XP</p>
          </div>
        </div>
      </div>
    </div>
  )
}


