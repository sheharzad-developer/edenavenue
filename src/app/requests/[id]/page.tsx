'use client'

import { useParams } from 'next/navigation'
import RequestDetails from '@/components/RequestDetails'

export default function RequestDetailPage() {
  const params = useParams()
  const requestId = params.id as string

  return (
    <div className="container mx-auto px-4 py-8">
      <RequestDetails id={requestId} />
    </div>
  )
}
