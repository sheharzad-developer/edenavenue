'use client'

import { Shield, Building2, AlertTriangle, ChevronRight, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardStatsProps {
  stats: {
    requests: {
      open: number
      inProgress: number
      resolved: number
      total: number
      recent: number
      unassigned: number
    }
    properties: {
      total: number
      units: number
      occupiedUnits: number
    }
    residents: {
      total: number
    }
    notices: {
      urgent: number
    }
  }
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const router = useRouter()

  const cards = [
    {
      id: 'status',
      title: 'Request Status',
      value: stats.requests.open === 0 ? 'Good' : 'Attention Needed',
      subtitle: 'Request Status',
      icon: Shield,
      color: stats.requests.open === 0 ? 'bg-green-500' : 'bg-yellow-500',
      bgColor: stats.requests.open === 0 ? 'bg-green-50' : 'bg-yellow-50',
      textColor: stats.requests.open === 0 ? 'text-green-700' : 'text-yellow-700',
      action: 'View Detailed Report',
      actionPath: '/dashboard/requests',
    },
    {
      id: 'requests',
      title: 'Total Requests',
      value: stats.requests.total.toString(),
      subtitle: `Requests: ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      action: 'View Detailed Report',
      actionPath: '/dashboard/requests',
    },
    {
      id: 'properties',
      title: 'Properties Available',
      value: stats.properties.total.toString(),
      subtitle: 'Properties Available',
      icon: Building2,
      color: 'bg-cyan-500',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-700',
      action: 'Visit Properties',
      actionPath: '/properties',
    },
    {
      id: 'urgent',
      title: 'Urgent Notices',
      value: stats.notices.urgent.toString(),
      subtitle: 'Urgent Notices',
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      action: 'Resolve Now',
      actionPath: '/notices',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map(card => {
        const Icon = card.icon
        return (
          <div
            key={card.id}
            className={`${card.bgColor} rounded-lg p-6 border-2 border-transparent hover:border-gray-200 transition-all cursor-pointer`}
            onClick={() => card.actionPath && router.push(card.actionPath)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="text-white" size={24} />
              </div>
            </div>
            <div className="mb-4">
              <p className={`text-2xl font-bold ${card.textColor} mb-1`}>{card.value}</p>
              <p className={`text-sm ${card.textColor} opacity-80`}>{card.subtitle}</p>
            </div>
            <button
              className={`flex items-center gap-1 text-sm font-semibold ${card.textColor} hover:opacity-80 transition-opacity`}
              onClick={e => {
                e.stopPropagation()
                if (card.actionPath) {
                  router.push(card.actionPath)
                }
              }}
            >
              {card.action} <ChevronRight size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
