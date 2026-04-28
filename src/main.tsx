import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'

// Stale cached index.html may reference old chunk hashes after a new deployment.
// Reload once so the browser fetches the new index.html with correct asset URLs.
//
// preventDefault() stops the error bubbling to React's ErrorBoundary + Sentry
// (it's expected behavior, not a bug). The session-storage guard stops an
// infinite reload loop in the rare case the fresh deploy also can't preload.
const PRELOAD_RELOAD_FLAG = 'pathwise:preload-reload'
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()
  if (sessionStorage.getItem(PRELOAD_RELOAD_FLAG)) return
  sessionStorage.setItem(PRELOAD_RELOAD_FLAG, '1')
  window.location.reload()
})
// Clear the guard once the new bundle has run for ~10s without re-erroring.
setTimeout(() => sessionStorage.removeItem(PRELOAD_RELOAD_FLAG), 10_000)

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
  // Drop the noisy chunk/CSS-preload errors that fire whenever a user has
  // a stale tab across a deploy. We already auto-reload on those, so
  // they're not actionable bugs.
  ignoreErrors: [
    /Unable to preload CSS/i,
    /Failed to fetch dynamically imported module/i,
    /Loading chunk \d+ failed/i,
    /Importing a module script failed/i,
    // Chrome autofill/password-manager extension noise — not app code
    /Object Not Found Matching Id/i,
  ],
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
