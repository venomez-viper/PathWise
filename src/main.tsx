import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'

// Stale cached index.html may reference old chunk hashes after a new deployment.
// Reload once so the browser fetches the new index.html with correct asset URLs.
window.addEventListener('vite:preloadError', () => {
  window.location.reload()
})
import './index.css'
import App from './App.tsx'

// Initialize Sentry error tracking (needs to be early to catch errors)
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  environment: import.meta.env.MODE,
  enabled: !!import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
  ],
  tracesSampleRate: 0.3,
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    // Don't send events in local dev without DSN
    if (!import.meta.env.VITE_SENTRY_DSN) return null;
    return event;
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Defer PostHog initialization until after first paint
const initPostHog = () => {
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init('phc_tQX3SgebpgusQh8PYFc2sskvgr9mwhy4hrwKUmEdyc56', {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
    })
  })
}

if (typeof requestIdleCallback === 'function') {
  requestIdleCallback(initPostHog)
} else {
  setTimeout(initPostHog, 1)
}
