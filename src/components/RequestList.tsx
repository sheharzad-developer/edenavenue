'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function RequestList() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => setRequests(data.requests || []))
  }, [])

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Author</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Priority</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id} className="border-t">
              <td className="border px-4 py-2">{req.title}</td>
              <td className="border px-4 py-2">{req.author?.name || req.author?.email}</td>
              <td className="border px-4 py-2">{req.status}</td>
              <td className="border px-4 py-2">{req.priority}</td>
              <td className="border px-4 py-2">
                <Link
                  href={`/dashboard/requests/${req.id}`}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
