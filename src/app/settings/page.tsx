'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Select from '@/components/ui/Select'
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  Mail,
  Key,
  Palette,
  Save,
} from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import MobileNav from '@/components/MobileNav'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    maintenanceAlerts: true,
    noticeAlerts: true,

    // Application Settings
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',

    // Security Settings
    sessionTimeout: 30,
    requireTwoFactor: false,
    passwordExpiry: 90,

    // Email Settings
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Eden Avenue Management',

    // API Settings
    openAiApiKey: '',
    enableAiChat: false,
  })

  const userRole = (session?.user as { role?: string })?.role

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      router.push('/dashboard')
    }
  }, [status, router, userRole])

  const handleSave = async (section: string) => {
    setSaving(true)
    try {
      // In a real app, this would save to database/API
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert(`${section} settings saved successfully!`)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !['ADMIN', 'MANAGER'].includes(userRole || '')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <main className="md:ml-64 mt-16 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="w-8 h-8 text-[#1e3a5f]" />
              <h1 className="text-3xl font-bold text-gray-800">Application Settings</h1>
            </div>
            <p className="text-gray-600">Configure application preferences and system settings</p>
          </div>

          {/* Notification Settings */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-yellow-600" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={e => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive browser push notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={e => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Alerts</Label>
                  <p className="text-sm text-gray-500">Get alerts for new maintenance requests</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceAlerts}
                  onChange={e => setSettings({ ...settings, maintenanceAlerts: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notice Alerts</Label>
                  <p className="text-sm text-gray-500">Get alerts for new notices</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.noticeAlerts}
                  onChange={e => setSettings({ ...settings, noticeAlerts: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <Button
                onClick={() => handleSave('Notification')}
                disabled={saving}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>

          {/* Application Preferences */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                <CardTitle>Application Preferences</CardTitle>
              </div>
              <CardDescription>Customize your application experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select
                  id="theme"
                  value={settings.theme}
                  onChange={e => setSettings({ ...settings, theme: e.target.value })}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  id="language"
                  value={settings.language}
                  onChange={e => setSettings({ ...settings, language: e.target.value })}
                >
                  <option value="en">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  id="timezone"
                  value={settings.timezone}
                  onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  id="dateFormat"
                  value={settings.dateFormat}
                  onChange={e => setSettings({ ...settings, dateFormat: e.target.value })}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </Select>
              </div>
              <Button
                onClick={() => handleSave('Application')}
                disabled={saving}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={e =>
                    setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 30 })
                  }
                  min={5}
                  max={480}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Users will be logged out after inactivity
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Enforce 2FA for all users</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.requireTwoFactor}
                  onChange={e => setSettings({ ...settings, requireTwoFactor: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <div>
                <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                <Input
                  id="passwordExpiry"
                  type="number"
                  value={settings.passwordExpiry}
                  onChange={e =>
                    setSettings({ ...settings, passwordExpiry: parseInt(e.target.value) || 90 })
                  }
                  min={30}
                  max={365}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Force password change after this many days
                </p>
              </div>
              <Button
                onClick={() => handleSave('Security')}
                disabled={saving}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>

          {/* Email Configuration */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <CardTitle>Email Configuration</CardTitle>
              </div>
              <CardDescription>Configure SMTP settings for sending emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    type="text"
                    value={settings.smtpHost}
                    onChange={e => setSettings({ ...settings, smtpHost: e.target.value })}
                    placeholder="smtp.example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={settings.smtpPort}
                    onChange={e =>
                      setSettings({ ...settings, smtpPort: parseInt(e.target.value) || 587 })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    type="text"
                    value={settings.smtpUser}
                    onChange={e => setSettings({ ...settings, smtpUser: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.smtpPassword}
                    onChange={e => setSettings({ ...settings, smtpPassword: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.fromEmail}
                    onChange={e => setSettings({ ...settings, fromEmail: e.target.value })}
                    placeholder="noreply@edenavenue.com"
                  />
                </div>
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    type="text"
                    value={settings.fromName}
                    onChange={e => setSettings({ ...settings, fromName: e.target.value })}
                  />
                </div>
              </div>
              <Button
                onClick={() => handleSave('Email')}
                disabled={saving}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Email Settings
              </Button>
            </CardContent>
          </Card>

          {/* AI Chat Settings */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <CardTitle>AI Chat Configuration</CardTitle>
              </div>
              <CardDescription>Configure AI chat assistant settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable AI Chat</Label>
                  <p className="text-sm text-gray-500">Enable AI-powered chat assistant</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableAiChat}
                  onChange={e => setSettings({ ...settings, enableAiChat: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
              <div>
                <Label htmlFor="openAiApiKey">OpenAI API Key</Label>
                <Input
                  id="openAiApiKey"
                  type="password"
                  value={settings.openAiApiKey}
                  onChange={e => setSettings({ ...settings, openAiApiKey: e.target.value })}
                  placeholder="sk-..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optional: Add OpenAI API key for advanced AI responses. Leave empty to use
                  rule-based responses.
                </p>
              </div>
              <Button
                onClick={() => handleSave('AI Chat')}
                disabled={saving}
                className="w-full md:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                Save AI Settings
              </Button>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-gray-600" />
                <CardTitle>System Information</CardTitle>
              </div>
              <CardDescription>View system status and information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Environment</Label>
                  <p className="text-muted-foreground">{process.env.NODE_ENV || 'development'}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Application Version</Label>
                  <p className="text-muted-foreground">v1.0.0</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Current User</Label>
                  <p className="text-muted-foreground">
                    {session?.user?.name || session?.user?.email || 'Unknown'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">User Role</Label>
                  <p className="text-muted-foreground">{userRole}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
