import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Release Tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  environment: process.env.NODE_ENV,
  
  // Capture console errors
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ["error", "warn"],
    }),
  ],
});