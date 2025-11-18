'use client'

import { useState, useEffect } from 'react'

export default function RequestDetails({ id }: { id: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [request, setRequest] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/requests/${id}`)
      .then(res => res.json())
      .then(data => setRequest(data.request))
  }, [id])

  if (!request) return <p>Loading...</p>

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold">{request.title}</h1>
      <p>{request.description}</p>
      <p>Status: {request.status}</p>
      <p>Priority: {request.priority}</p>
    </div>
  )
}
