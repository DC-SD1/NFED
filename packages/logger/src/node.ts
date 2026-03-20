import type { TransportTargetOptions } from "pino";
import pino from "pino";

import { BaseLogger, type Logger, type LoggerOptions } from "./index";

interface NodeLoggerOptions extends LoggerOptions {
  betterStackToken?: string;
}

function createTransport(
  options: NodeLoggerOptions,
): pino.TransportMultiOptions | pino.TransportSingleOptions | undefined {
  // Check if we're in Next.js SSR context
  const isSSR =
    typeof window === "undefined" && process.env.NEXT_RUNTIME !== "edge";

  // In SSR context, disable worker threads to avoid path resolution issues
  if (isSSR) {
    return undefined;
  }

  const targets: TransportTargetOptions[] = [];

  // Pretty print in development
  if (options.prettyPrint || process.env.NODE_ENV === "development") {
    targets.push({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
      level: options.level ?? "debug",
    });
  }

  // Better Stack integration for production
  const betterStackToken =
    options.betterStackToken ?? process.env.BETTER_STACK_TOKEN;
  if (betterStackToken && process.env.NODE_ENV === "production") {
    targets.push({
      target: "./better-stack-transport",
      options: {
        sourceToken: betterStackToken,
      },
      level: options.level ?? "info",
    });
  }

  if (targets.length === 0) {
    return undefined;
  }

  return targets.length === 1 ? targets[0] : { targets };
}

export function createLogger(options: NodeLoggerOptions = {}): Logger {
  const transport = createTransport(options);

  // Check if we're in Next.js SSR context
  const isSSR =
    typeof window === "undefined" && process.env.NEXT_RUNTIME !== "edge";

  const pinoOptions: pino.LoggerOptions = {
    name: options.name ?? "cf-app",
    level:
      options.level ??
      (process.env.NODE_ENV === "production" ? "info" : "debug"),
    base: {
      env: process.env.NODE_ENV,
      revision: process.env.VERCEL_GIT_COMMIT_SHA,
    },
    redact: {
      paths: ["password", "email", "token", "authorization", "cookie"],
      remove: true,
    },
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
      req: (req: any) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        headers: {
          "user-agent": req.headers?.["user-agent"],
          "content-type": req.headers?.["content-type"],
        },
        remoteAddress: req.ip ?? req.connection?.remoteAddress,
      }),
      res: (res: any) => ({
        statusCode: res.statusCode,
        headers: res.getHeaders?.(),
      }),
    },
  };

  // Only add transport if not in SSR or if transport is configured without workers
  if (!isSSR && transport) {
    pinoOptions.transport = transport;
  } else if (isSSR && process.env.NODE_ENV === "development") {
    // In SSR dev mode, use formatters for basic pretty printing without workers
    pinoOptions.formatters = {
      level: (label) => ({ level: label }),
      log: (obj) => obj,
    };
  }

  const pinoLogger = pino(pinoOptions);

  return new BaseLogger(pinoLogger);
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
