'use client'

import { useEffect, useState } from 'react'
import PWAInstallPrompt from './PWAInstallPrompt'

export default function PWARegister() {
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Register service worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Use setTimeout to avoid setState in effect
      setTimeout(() => setIsSupported(true), 0)

      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then(registration => {
          console.log('[PWA] Service Worker registered:', registration.scope)

          // Force update check on page load
          registration.update()

          // Check for updates more frequently in development
          const isDev = process.env.NODE_ENV === 'development'
          const updateInterval = isDev ? 30 * 1000 : 60 * 60 * 1000 // 30 seconds in dev, 1 hour in prod

          setInterval(() => {
            registration.update()
          }, updateInterval)
        })
        .catch(error => {
          console.error('[PWA] Service Worker registration failed:', error)
        })

      // Listen for service worker updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Service Worker updated, reloading...')
        window.location.reload()
      })
    }
  }, [])

  if (!isSupported) {
    return null
  }

  return (
    <>
      <PWAInstallPrompt />
      {/* Add meta tags for iOS */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Eden Avenue" />
    </>
  )
}
