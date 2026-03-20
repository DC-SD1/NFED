/**
 * Simple logger utility for production error tracking
 * In a real production app, this would integrate with services like Sentry, LogRocket, etc.
 */

const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  error: (
    message: string,
    error?: unknown,
    context?: Record<string, unknown>,
  ) => {
    if (isDevelopment) {
      const args: any[] = [message];
      if (error !== undefined) args.push(error);
      if (context !== undefined) args.push(context);
      console.error(...args);
    } else {
      // In production, this would send to an error tracking service
      // For now, we'll just suppress console output in production
      // TODO: Integrate with error tracking service (e.g., Sentry)
    }
  },

  warn: (message: string, context?: Record<string, unknown>) => {
    if (isDevelopment) {
      const args: any[] = [message];
      if (context !== undefined) args.push(context);
      console.warn(...args);
    }
  },

  info: (message: string, context?: Record<string, unknown>) => {
    if (isDevelopment) {
      const args: any[] = [message];
      if (context !== undefined) args.push(context);
      console.log(...args);
    }
  },
  debug: (message: string, context?: Record<string, unknown>) => {
    if (isDevelopment) {
      const args: any[] = [message];
      if (context !== undefined) args.push(context);
      console.debug(...args);
    }
  },
};
