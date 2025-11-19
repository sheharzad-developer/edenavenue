import { useEffect, useRef, useState } from 'react'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  sound?: boolean
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      // Initialize permission state (this is safe as it's just reading initial state)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermission(Notification.permission)
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(perm => {
          setPermission(perm)
        })
      }
    }

    // Create audio context for sound
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio()
    }
  }, [])

  const playSound = () => {
    try {
      // Create a pleasant notification sound using Web Audio API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      // Play a two-tone chime sound
      const playTone = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = frequency
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0, startTime)
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }

      const now = audioContext.currentTime
      playTone(800, now, 0.2)
      playTone(1000, now + 0.15, 0.2)
    } catch (error) {
      console.error('Error playing sound:', error)
    }
  }

  const showNotification = ({ title, body, icon, sound = true }: NotificationOptions) => {
    // Always play sound if requested (even without notification permission)
    if (sound) {
      playSound()
    }

    if (permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'maintenance-request',
        requireInteraction: false,
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    } else if (permission === 'default') {
      Notification.requestPermission().then(perm => {
        setPermission(perm)
        if (perm === 'granted') {
          const notification = new Notification(title, {
            body,
            icon: icon || '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'maintenance-request',
            requireInteraction: false,
          })

          notification.onclick = () => {
            window.focus()
            notification.close()
          }
        }
      })
    }
  }

  return { showNotification, permission }
}
