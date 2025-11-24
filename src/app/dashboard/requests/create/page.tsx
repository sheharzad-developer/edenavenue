'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import RequestForm from '@/components/RequestForm'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import MobileNav from '@/components/MobileNav'
import { FileText, Sparkles } from 'lucide-react'

export default function CreateRequestPage() {
  const { status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold text-[#1e3a5f]">New Maintenance Request</h2>
          <p className="text-gray-600">Preparing your request workspace...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />
      <main className="md:ml-64 mt-16 p-4 md:p-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          {/* Hero header */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a5f] via-sky-700 to-emerald-600 p-6 md:p-8 text-white shadow-lg">
            <div className="pointer-events-none absolute inset-y-0 right-0 opacity-15 md:opacity-20">
              <FileText className="h-full w-40 md:w-56" />
            </div>
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  Guided request form
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  Create Maintenance Request
                </h1>
                <p className="mt-2 max-w-xl text-sm md:text-base text-sky-100">
                  Tell us what&apos;s wrong in a few clear steps. The more detail you provide, the
                  faster your team can respond and resolve the issue.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/requests')}
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20 text-xs md:text-sm"
                >
                  Back to Requests
                </Button>
              </div>
            </div>
          </section>

          {/* Form card */}
          <section>
            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
              <CardHeader className="border-b border-gray-100 pb-4">
                <CardTitle className="text-lg">Request details</CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Fill in the information below and submit. You&apos;ll be able to track status in
                  the requests dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <RequestForm
                  onCancel={() => {
                    router.push('/dashboard/requests')
                  }}
                />
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
