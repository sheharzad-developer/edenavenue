'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Show form immediately
  useEffect(() => {
    setShowForm(true)
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please enter both email and password')
      setLoading(false)
      return
    }

    try {
      const callbackUrl =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('callbackUrl') || '/dashboard'
          : '/dashboard'

      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim(),
        password,
        callbackUrl,
      })

      if (res?.ok) {
        // Wait a moment for session to be set, then redirect
        await new Promise(resolve => setTimeout(resolve, 200))
        // Force a full page navigation to prevent loops
        window.location.href = callbackUrl
      } else {
        // Show user-friendly error message
        const errorMessage =
          res?.error === 'CredentialsSignin'
            ? 'Invalid email or password. Please check your credentials and try again.'
            : res?.error || 'Login failed. Please try again.'
        setError(errorMessage)
        console.error('Login failed:', res?.error, res)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show form immediately, don't wait for session check
  if (!showForm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Eden Avenue Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
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
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
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
