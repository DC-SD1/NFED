import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Release Tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  environment: process.env.NODE_ENV,
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Filter out certain errors
  ignoreErrors: [
    // Browser extensions
    "top.GLOBALS",
    // Random network errors
    "Network request failed",
    "NetworkError",
    "Failed to fetch",
  ],
  
  beforeSend(event, hint) {
    // Filter out errors from browser extensions
    if (event.exception) {
      const error = hint.originalException;
      if (error?.toString?.().includes("extension://")) {
        return null;
      }
    }
    return event;
  },
});