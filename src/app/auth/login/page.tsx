'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (res?.ok) {
        router.push('/dashboard')
        router.refresh()
      } else {
        // Show user-friendly error message
        const errorMessage =
          res?.error === 'CredentialsSignin'
            ? 'Invalid email or password. Please check your credentials and try again.'
            : res?.error || 'Login failed. Please try again.'
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('An error occurred during login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Eden Avenue Management
        </h2>
      </div>
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
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
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Logging in...' : 'Login'}
        </Button>
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <a
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Sign up
          </a>
        </div>
      </form>
    </div>
  )
}
