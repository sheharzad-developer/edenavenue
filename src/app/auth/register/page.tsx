'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('RESIDENT')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/auth/login')
      } else {
        alert(data.error || 'Registration failed')
        console.error('Registration error:', data)
      }
    } catch (err) {
      console.error(err)
      alert('Registration error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/auth/login')}>
            ← Back to Login
          </Button>
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50 p-8 hover-lift">
          <div className="mb-6 text-center">
            <h2 className="text-4xl font-bold gradient-text mb-2">Eden Avenue Management</h2>
            <p className="text-muted-foreground">Create your account</p>
          </div>
          <h1 className="text-2xl font-bold mb-6 text-foreground">Register</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Role</Label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full border rounded px-2 py-1"
              >
                <option value="RESIDENT">Resident</option>
                <option value="MANAGER">Manager</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary hover:opacity-90 transition-opacity"
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
