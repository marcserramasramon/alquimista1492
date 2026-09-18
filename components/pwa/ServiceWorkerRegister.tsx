'use client'

import { useEffect } from 'react'

/**
 * Registers the (deliberately empty) service worker so the browser treats
 * the webapp as installable and fires `beforeinstallprompt`. Rendered once
 * from the root layout — no UI.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service worker registration failed:', err)
      })
    }
  }, [])

  return null
}
