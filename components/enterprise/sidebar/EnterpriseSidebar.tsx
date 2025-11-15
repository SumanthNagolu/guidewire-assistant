'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { 
  Building,
  Users,
  BarChart3,
  Target,
  Settings,
  Home,
  ArrowLeft,
  UserCog,
  FileBarChart,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface EnterpriseSidebarProps {
  organization: {
    id: string
    name: string
    logo_url?: string | null
  }
  userRole: string
}

const navigation = [
  { name: 'Dashboard', href: '/enterprise', icon: Home },
  { name: 'Team Members', href: '/enterprise/members', icon: Users },
  { name: 'Analytics', href: '/enterprise/analytics', icon: BarChart3 },
  { name: 'Learning Goals', href: '/enterprise/goals', icon: Target },
  { name: 'Reports', href: '/enterprise/reports', icon: FileBarChart },
]

const adminNavigation = [
  { name: 'Manage Users', href: '/enterprise/manage', icon: UserCog },
  { name: 'Billing', href: '/enterprise/billing', icon: CreditCard },
  { name: 'Settings', href: '/enterprise/settings', icon: Settings },
]

export function EnterpriseSidebar({ organization, userRole }: EnterpriseSidebarProps) {
  const pathname = usePathname()
  const isAdmin = ['admin', 'owner'].includes(userRole)

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      {/* Organization Header */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Building className="h-8 w-8 text-primary-600 mr-2" />
        <div className="flex-1">
          <span className="text-xl font-bold text-gray-900 truncate">
            {organization.name}
          </span>
          <p className="text-xs text-gray-500">Enterprise</p>
        </div>
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

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            <div className="mt-8 mb-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
            </div>
            <nav className="space-y-1">
              {adminNavigation.map((item) => {
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
          </>
        )}
      </ScrollArea>

      {/* Back to Learning */}
      <div className="p-3 border-t border-gray-200">
        <Link href="/academy">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Learning
          </Button>
        </Link>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
            {userRole[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 capitalize">{userRole}</p>
            <p className="text-xs text-gray-500">{organization.name}</p>
          </div>
        </div>
      </div>
    </div>
  )
}


