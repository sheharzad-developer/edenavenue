'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, FileText, Bell, User, Plus } from 'lucide-react'

export default function MobileNav() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // Only show for authenticated users
  if (!session) {
    return null
  }

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      show: true,
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: FileText,
      path: '/dashboard/requests',
      show: true,
    },
    {
      id: 'new-request',
      label: 'New',
      icon: Plus,
      path: '/dashboard/requests/create',
      show: true,
    },
    {
      id: 'notices',
      label: 'Notices',
      icon: Bell,
      path: '/notices',
      show: true,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      show: true,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden pb-safe">
      <div
        className="flex justify-around items-center h-16 px-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.path
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={item.label}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
