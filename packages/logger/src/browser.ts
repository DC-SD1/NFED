import type { Logger, LoggerOptions } from "./index";

// Browser-safe logger implementation
class BrowserLogger implements Logger {
  private name: string;
  private level: string;
  private context: Record<string, any>;

  constructor(options: LoggerOptions & { context?: Record<string, any> }) {
    this.name = options.name || "cf-app";
    this.level = options.level || "info";
    this.context = options.context || {};
  }

  private shouldLog(level: string): boolean {
    const levels = ["debug", "info", "warn", "error", "fatal"];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(
    level: string,
    message: string,
    meta?: Record<string, any>,
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr =
      Object.keys(this.context).length > 0
        ? ` ${JSON.stringify(this.context)}`
        : "";
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${level.toUpperCase()} [${this.name}]${contextStr}: ${message}${metaStr}`;
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message, meta));
    }
  }

  info(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message, meta));
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, meta));
    }
  }

  error(message: string | Error, meta?: Record<string, any>): void {
    if (this.shouldLog("error")) {
      if (message instanceof Error) {
        console.error(
          this.formatMessage("error", message.message, {
            ...meta,
            stack: message.stack,
          }),
        );
      } else {
        console.error(this.formatMessage("error", message, meta));
      }
    }
  }

  fatal(message: string | Error, meta?: Record<string, any>): void {
    if (this.shouldLog("fatal")) {
      if (message instanceof Error) {
        console.error(
          this.formatMessage("fatal", message.message, {
            ...meta,
            stack: message.stack,
          }),
        );
      } else {
        console.error(this.formatMessage("fatal", message, meta));
      }
    }
  }

  child(bindings: Record<string, any>): Logger {
    return new BrowserLogger({
      name: this.name,
      level: this.level,
      context: { ...this.context, ...bindings },
    });
  }
}

export function createLogger(options: LoggerOptions = {}): Logger {
  return new BrowserLogger({
    ...options,
    level:
      options.level ||
      (process.env.NODE_ENV === "production" ? "info" : "debug"),
  });
}

// Singleton logger instance
let defaultLogger: Logger;

export function getLogger(name?: string): Logger {
  if (!defaultLogger) {
    defaultLogger = createLogger({ name });
  }
  return name ? defaultLogger.child({ service: name }) : defaultLogger;
}

// Export convenience methods
export const logger = getLogger();
