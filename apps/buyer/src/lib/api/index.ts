/**
 * Unified API client module for the application.
 * 
 * This module provides a simplified interface for accessing the API
 * from client contexts.
 * 
 * @module api
 */

// Shared utilities (safe for both client and server)
export { createApiClientWithToken, getPublicApiClient } from "./shared";

// Client-side exports
export { useApiClient } from "./client-exports";