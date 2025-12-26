'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Show form immediately - no delay
  useEffect(() => {
    console.log('=== LOGIN PAGE LOADED ===')
    console.log('Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR')
    console.log('Query params:', typeof window !== 'undefined' ? window.location.search : 'SSR')
    setShowForm(true)
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    console.log('=== LOGIN FORM SUBMITTED ===')
    console.log('Email:', email)
    console.log('Password length:', password.length)

    setError('')
    setLoading(true)

    if (!email || !password) {
      console.log('Validation failed: Missing email or password')
      setError('Please enter both email and password')
      setLoading(false)
      return
    }

    try {
      console.log('Calling signIn with credentials...')
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim(),
        password,
      })

      console.log('=== SIGNIN RESPONSE ===')
      console.log('Response:', res)
      console.log('Response OK:', res?.ok)
      console.log('Response Error:', res?.error)
      console.log('Response Status:', res?.status)

      if (res?.ok) {
        console.log('✅ Login successful!')

        // Get callbackUrl from URL if provided by middleware, otherwise use /dashboard
        const urlParams = new URLSearchParams(window.location.search)
        const callbackUrl = urlParams.get('callbackUrl') || '/dashboard'
        console.log('Redirecting to:', callbackUrl)

        // Wait a moment for session cookie to be set before redirecting
        // This prevents middleware from seeing an unauthenticated state
        await new Promise(resolve => setTimeout(resolve, 500))

        // Always use full page reload for serverless environments
        // This ensures session cookies are properly set
        window.location.href = callbackUrl
      } else {
        console.log('❌ Login failed')
        // Show user-friendly error message
        const errorMessage =
          res?.error === 'CredentialsSignin'
            ? 'Invalid email or password. Please check your credentials and try again.'
            : res?.error || 'Login failed. Please try again.'
        setError(errorMessage)
        console.error('Login failed details:', {
          error: res?.error,
          status: res?.status,
          url: res?.url,
          ok: res?.ok,
        })
        setLoading(false) // Re-enable form on error
      }
    } catch (error) {
      console.error('=== EXCEPTION IN LOGIN ===')
      console.error('Error type:', typeof error)
      console.error('Error:', error)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
      setError('An error occurred during login. Please try again.')
    } finally {
      console.log('Login attempt completed, setting loading to false')
      setLoading(false)
    }
  }

  // Show form immediately, don't wait for session check
  if (!showForm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <h2 className="text-4xl font-bold gradient-text mb-2">Eden Avenue Management</h2>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold gradient-text mb-2">Eden Avenue Management</h2>
          <p className="text-muted-foreground">Welcome back</p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border border-border/50 p-8 hover-lift"
        >
          <h1 className="text-2xl font-bold mb-6 text-foreground">Login</h1>
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
            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary hover:opacity-90 transition-opacity"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="text-xs text-muted-foreground text-center mt-2">
              Demo admin credentials:&nbsp;
              <span className="font-mono">admin@example.com</span>&nbsp;/&nbsp;
              <span className="font-mono">12345</span>
            </div>
            <div className="text-center text-sm text-muted-foreground mt-4">
              Don&apos;t have an account?{' '}
              <a
                href="/auth/register"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign up
              </a>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
