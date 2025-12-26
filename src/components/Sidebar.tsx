'use client'

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Bell,
  MessageSquare,
  Settings,
  ChevronDown,
  MoreVertical,
  Home,
  X,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  path?: string
  children?: NavItem[]
  badge?: number
  show?: boolean
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const userRole = (session?.user as { role?: string })?.role || 'RESIDENT'
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || 'User'

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: FileText,
      path: '/dashboard/requests',
    },
    {
      id: 'properties',
      label: 'Properties',
      icon: Building2,
      path: '/properties',
      show: ['ADMIN', 'MANAGER'].includes(userRole),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      children: [
        {
          id: 'reports-all',
          label: 'All Reports',
          path: '/dashboard/requests',
          icon: FileText,
        },
        {
          id: 'reports-stats',
          label: 'Statistics',
          path: '/dashboard',
          icon: LayoutDashboard,
        },
      ],
      show: ['ADMIN', 'MANAGER'].includes(userRole),
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: Settings,
      path: '/configuration',
      show: ['ADMIN', 'MANAGER'].includes(userRole),
    },
    {
      id: 'residents',
      label: 'Residents',
      icon: Users,
      path: '/residents',
      show: ['ADMIN', 'MANAGER'].includes(userRole),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/notices',
      badge: 0, // Could be dynamic
    },
    {
      id: 'chat',
      label: 'Chat with Visitors',
      icon: MessageSquare,
      path: '/chat',
      show: ['ADMIN', 'MANAGER'].includes(userRole),
    },
    {
      id: 'settings',
      label: 'Application Settings',
      icon: Settings,
      path: '/settings',
      show: ['ADMIN', 'MANAGER'].includes(userRole),
    },
  ]

  const filteredNavItems = navItems.filter(item => {
    if (item.show === false) return false
    if (item.show === true) return true
    // If show is undefined, check role-based visibility
    if (item.show === undefined) {
      // Items without show property are visible to all
      return true
    }
    return true
  })

  const isActive = (item: NavItem) => {
    if (item.path) {
      return pathname === item.path
    }
    if (item.children) {
      return item.children.some(child => child.path === pathname)
    }
    return false
  }

  const handleNavClick = (item: NavItem) => {
    if (item.children) {
      toggleExpanded(item.id)
    } else if (item.path) {
      router.push(item.path)
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onClose} />
      )}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed left-0 top-0 h-screen w-64 bg-[#1e3a5f] text-white flex flex-col z-40 transition-transform duration-300 ease-in-out`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[#2a4a6f] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <Home className="w-5 h-5 text-[#1e3a5f]" />
            </div>
            <span className="text-xl font-bold">Eden Avenue</span>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-[#2a4a6f]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2a4a6f] rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">
                {userRole === 'ADMIN' ? 'Super Admin' : userRole}
              </p>
            </div>
            <div className="relative">
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => setProfileMenuOpen(prev => !prev)}
                aria-label="Profile menu"
              >
                <MoreVertical size={16} />
              </button>
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-40 rounded-lg bg-white text-gray-800 shadow-lg z-50">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false)
                        router.push('/profile')
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 rounded-t-lg"
                    >
                      View profile
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {filteredNavItems.map(item => {
            const Icon = item.icon
            const active = isActive(item)
            const expanded = expandedItems.has(item.id)
            const hasChildren = item.children && item.children.length > 0

            return (
              <div key={item.id}>
                <button
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center justify-between px-6 py-3 text-left transition-colors ${
                    active
                      ? 'bg-[#0ea5e9] text-white'
                      : 'text-gray-300 hover:bg-[#2a4a6f] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                    {hasChildren && (
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                      />
                    )}
                  </div>
                </button>
                {hasChildren && expanded && (
                  <div className="bg-[#152d47]">
                    {item.children?.map(child => {
                      const childActive = pathname === child.path
                      return (
                        <button
                          key={child.id}
                          onClick={() => child.path && router.push(child.path)}
                          className={`w-full flex items-center gap-3 px-6 py-2 pl-12 text-left text-sm transition-colors ${
                            childActive
                              ? 'bg-[#0ea5e9] text-white'
                              : 'text-gray-400 hover:bg-[#2a4a6f] hover:text-white'
                          }`}
                        >
                          {child.label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a4a6f] text-xs text-gray-400">
          <p className="mb-1">Powered by Eden Avenue © {new Date().getFullYear()}</p>
          <p>v 1.0.0</p>
        </div>
      </div>
    </>
  )
}
