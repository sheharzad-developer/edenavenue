'use client'

import { useState, useEffect } from 'react'
import { Search, ChevronDown, Sun, Menu } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

interface TopBarProps {
  onMenuClick?: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { data: session } = useSession()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [language, setLanguage] = useState('English (US)')
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
    return date.toLocaleDateString('en-US', options)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false })
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const languages = ['English (US)', 'English (UK)', 'Spanish', 'French', 'German']

  return (
    <div className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-30">
      {/* Logo and Search */}
      <div className="flex items-center gap-2 md:gap-6 flex-1 min-w-0">
        <button onClick={onMenuClick} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Menu size={24} className="text-gray-700" />
        </button>
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-[#1e3a5f] rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">EA</span>
          </div>
          <span className="text-lg font-bold text-gray-800">Eden Avenue</span>
        </div>
        <div className="relative flex-1 max-w-md min-w-0">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Right Side - Language, Greeting, Time */}
      <div className="hidden md:flex items-center gap-6 flex-shrink-0">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span>{language}</span>
            <ChevronDown size={16} />
          </button>
          {showLanguageDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowLanguageDropdown(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {languages.map(lang => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang)
                      setShowLanguageDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                      language === lang ? 'bg-gray-50 font-semibold' : ''
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Greeting and Time */}
        <div className="flex items-center gap-3">
          <Sun className="text-yellow-500" size={20} />
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{getGreeting()}</p>
            <p className="text-xs text-gray-600">
              {formatDate(currentTime)} {formatTime(currentTime)}
            </p>
          </div>
        </div>

        {/* User Menu */}
        {session && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {(session.user?.name || session.user?.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
              className="text-sm text-gray-700 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
