import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import App from './App.tsx'

// Initialize Sentry error tracking
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
