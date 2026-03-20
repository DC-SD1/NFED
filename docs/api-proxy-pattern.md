# API Proxy Pattern Documentation

## Overview

This application uses an enhanced API proxy pattern to handle authentication for client-side API calls. This approach maintains security by keeping authentication tokens in HTTP-only cookies while enabling seamless API communication with advanced features.

## Architecture

```
Client Browser → Next.js App → API Proxy Route → Backend API
                     ↓
              HTTP-only Cookies
              (cf-auth-access)
```

## How It Works

1. **Client-Side API Calls**:

   - Use `useApiClient()` hook in React components
   - All API calls go to `/api/proxy/*` endpoints
   - No direct access to authentication tokens

2. **API Proxy Route** (`/api/proxy/[...path]/route.ts`):

   - Catches all requests to `/api/proxy/*`
   - Reads authentication tokens from HTTP-only cookies server-side
   - Automatically refreshes expired tokens
   - Forwards requests to the backend API with proper Authorization headers
   - Returns backend responses to the client

3. **Security Benefits**:
   - Authentication tokens remain in HTTP-only cookies (XSS protection)
   - Tokens are never exposed to client-side JavaScript
   - Server-side proxy adds multiple security layers

## Enhanced Features

### 1. Automatic Token Refresh

- Checks token expiration before each request
- Automatically refreshes expired tokens using refresh token
- Seamless experience with no user intervention required

### 2. Rate Limiting

- Per-user and per-IP rate limiting
- Different limits for auth endpoints, general API, and expensive operations
- Returns proper 429 status with retry information

### 3. Request/Response Interception

- Unique request ID generation for tracing
- Performance monitoring with response time headers
- Comprehensive request/response logging

### 4. Security Enhancements

- Request size validation (configurable limit)
- Security header injection
- Blocked header filtering
- XSS, clickjacking, and content-type protections

### 5. Content Type Handling

- Proper handling of JSON, FormData, text, and binary content
- Streaming support for large files
- Automatic content type detection

### 6. Error Handling

- Consistent error response format
- Network failure detection
- Timeout handling with configurable limits
- Detailed error logging with stack traces

### 7. Caching Support

- Forwards cache-related headers (ETag, Last-Modified, etc.)
- Supports conditional requests (If-None-Match, If-Modified-Since)
- Respects backend cache directives

### 8. Response Preservation

- Backend responses are passed through unchanged to preserve OpenAPI compatibility
- Error responses maintain the exact structure expected by the generated TypeScript client
- Only proxy-specific errors (network, timeout, rate limit) use a matching error format

## Usage Examples

### Client Component

```typescript
import { useApiClient } from "@/lib/api/client";

export function FarmsList() {
  const api = useApiClient();

  // This will call /api/proxy/farms which proxies to backend/api/farms
  const { data } = api.useQuery("get", "/farms");

  return <div>{/* render farms */}</div>;
}
```

### Server Component

```typescript
import { getServerApiClient } from "@/lib/api/server";

export default async function FarmsPage() {
  const api = await getServerApiClient();

  // Server components can call the backend directly
  const { data } = await api.GET("/farms");

  return <div>{/* render farms */}</div>;
}
```

## Configuration

### Environment Variables

```env
# Backend API URL (required)
BACKEND_API_URL=http://localhost:8000

# API Proxy Configuration (optional)
API_PROXY_TIMEOUT=30000      # Request timeout in ms (default: 30s)
MAX_REQUEST_SIZE=10485760    # Max request size in bytes (default: 10MB)
```

### Rate Limits

- **General API**: 100 requests per minute
- **Auth Endpoints**: 30 requests per 15 minutes
- **Expensive Operations**: 20 requests per hour

### Development

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API Proxy: `/api/proxy/*` → `http://localhost:8000/*`

### Production

- Use environment variable `BACKEND_API_URL` to configure the backend URL
- Consider using a reverse proxy (nginx/Caddy) to serve both frontend and backend from the same domain
- Configure rate limits based on your usage patterns

## Benefits

1. **Security**: Tokens never exposed to client-side code
2. **Simplicity**: Client code doesn't need to handle authentication
3. **Flexibility**: Proxy can add logging, rate limiting, etc.
4. **Consistency**: Same API client interface for client and server

## Alternative Approaches

If you need to avoid the proxy pattern:

1. **Server Components Only**: Use React Server Components for all data fetching
2. **Server Actions**: Use Next.js Server Actions for mutations
