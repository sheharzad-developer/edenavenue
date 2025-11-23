'use client'

import { ChevronRight, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DashboardSectionsProps {
  stats: {
    properties: {
      total: number
      units: number
      occupiedUnits: number
    }
    requests: {
      total: number
      thisMonth: number
      frequentRequest: string
    }
    residents: {
      total: number
    }
    staff: {
      total: number
    }
    notices: {
      total: number
      published: number
    }
  }
}

export default function DashboardSections({ stats }: DashboardSectionsProps) {
  const router = useRouter()
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  )
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)

  const months = [
    'January 2024',
    'February 2024',
    'March 2024',
    'April 2024',
    'May 2024',
    'June 2024',
    'July 2024',
    'August 2024',
    'September 2024',
    'October 2024',
    'November 2024',
    'December 2024',
    new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  ]

  const sections = [
    {
      id: 'properties',
      title: 'Properties',
      action: 'Go to Configuration',
      actionPath: '/properties',
      data: [
        { label: 'Total no of Properties', value: stats.properties.total.toString() },
        { label: 'Total Units', value: stats.properties.units.toString() },
      ],
    },
    {
      id: 'requests',
      title: 'Quick Report',
      action: selectedMonth,
      actionPath: null,
      isDropdown: true,
      data: [
        { label: 'Requests This Month', value: stats.requests.thisMonth.toString() },
        { label: 'Total Requests', value: stats.requests.total.toString() },
      ],
    },
    {
      id: 'management',
      title: 'Management',
      action: 'Go to User Management',
      actionPath: '/users',
      data: [
        { label: 'Total no of Staff', value: stats.staff.total.toString() },
        {
          label: 'Total no of Users',
          value: (stats.residents.total + stats.staff.total).toString(),
        },
      ],
    },
    {
      id: 'residents',
      title: 'Residents',
      action: 'Go to Residents Page',
      actionPath: '/residents',
      data: [
        { label: 'Total no of Residents', value: stats.residents.total.toString() },
        { label: 'Frequently Requested', value: stats.requests.frequentRequest },
      ],
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sections.map(section => (
        <div
          key={section.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
            {section.isDropdown ? (
              <div className="relative">
                <button
                  onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded hover:bg-gray-50"
                >
                  {section.action}
                  <ChevronDown size={16} />
                </button>
                {showMonthDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMonthDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                      {months.map(month => (
                        <button
                          key={month}
                          onClick={() => {
                            setSelectedMonth(month)
                            setShowMonthDropdown(false)
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                            selectedMonth === month ? 'bg-gray-50 font-semibold' : ''
                          }`}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => section.actionPath && router.push(section.actionPath)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {section.action} <ChevronRight size={16} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {section.data.map((item, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-800 mb-1">{item.value}</p>
                <p className="text-xs text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
