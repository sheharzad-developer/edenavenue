// Push Notification Service for PWA
export class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null

  async initialize() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported')
      return false
    }

    try {
      this.registration = await navigator.serviceWorker.ready
      return true
    } catch (error) {
      console.error('Error initializing service worker:', error)
      return false
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      return 'denied'
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  async subscribeToPush(userId: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      const initialized = await this.initialize()
      if (!initialized) {
        return null
      }
    }

    if (!this.registration) {
      return null
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      })

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription, userId)

      return subscription
    } catch (error) {
      console.error('Error subscribing to push:', error)
      return null
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        // Notify server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription }),
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
      return false
    }
  }

  private async sendSubscriptionToServer(
    subscription: PushSubscription,
    userId: string
  ): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          userId,
        }),
      })
    } catch (error) {
      console.error('Error sending subscription to server:', error)
    }
  }

  private urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray.buffer
  }

  async sendLocalNotification(title: string, options: NotificationOptions): Promise<void> {
    if (!this.registration) {
      return
    }

    await this.registration.showNotification(title, {
      ...options,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  }
}

export const pushNotificationService = new PushNotificationService()
