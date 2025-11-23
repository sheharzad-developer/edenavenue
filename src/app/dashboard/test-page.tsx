// Temporary test page to verify dashboard components are working
'use client'

export default function TestDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-4">Dashboard Test</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <p>If you can see this, the dashboard page is rendering.</p>
        <p className="mt-4 text-green-600">✓ Components are loading</p>
      </div>
    </div>
  )
}
