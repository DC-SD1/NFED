import type { Logger as PinoLogger } from "pino";

export interface LoggerOptions {
  name?: string;
  level?: string;
  prettyPrint?: boolean;
}

export interface Logger {
  debug: (message: string, meta?: Record<string, any>) => void;
  info: (message: string, meta?: Record<string, any>) => void;
  warn: (message: string, meta?: Record<string, any>) => void;
  error: (message: string | Error, meta?: Record<string, any>) => void;
  fatal: (message: string | Error, meta?: Record<string, any>) => void;
  child: (bindings: Record<string, any>) => Logger;
}

export class BaseLogger implements Logger {
  protected logger: PinoLogger;

  constructor(logger: PinoLogger) {
    this.logger = logger;
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(meta, message);
  }

  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(meta, message);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(meta, message);
  }

  error(message: string | Error, meta?: Record<string, any>): void {
    if (message instanceof Error) {
      this.logger.error({ ...meta, err: message }, message.message);
    } else {
      this.logger.error(meta, message);
    }
  }

  fatal(message: string | Error, meta?: Record<string, any>): void {
    if (message instanceof Error) {
      this.logger.fatal({ ...meta, err: message }, message.message);
    } else {
      this.logger.fatal(meta, message);
    }
  }

  child(bindings: Record<string, any>): Logger {
    return new BaseLogger(this.logger.child(bindings));
  }
}

// Re-export types
export type { Logger as PinoLogger } from "pino";
