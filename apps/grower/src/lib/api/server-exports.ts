/**
 * Server-side exports for the API module.
 * These exports should only be used in Server Components, Route Handlers, and Server Actions.
 * They contain server-only dependencies like @clerk/nextjs/server.
 */

export { getServerApiClient } from "./server";