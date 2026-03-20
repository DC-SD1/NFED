# Netlify Secret Scanning Resolution

## Issue

Netlify's secret scanning detects Google API keys (starting with "AIza") in webpack build caches (`.next/cache/` directory). This is expected behavior for client-side Google Maps API usage, but needs proper handling.

## Root Cause

The admin, grower, and buyer apps use `NEXT_PUBLIC_GOOGLE_MAP_KEY` for Google Maps Places API integration. This key must be exposed to the client-side code to work, which means it gets bundled into the webpack output.

### Example Usage

```typescript
// apps/admin/src/components/input-components/location-input.tsx
const PLACES_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;

<AutoComplete
  apiKey={PLACES_KEY}
  // ... other props
/>
```

## Solution

### 1. Exclude Build Caches from Secret Scanning

Created `.netlifyignore` files in each app directory:

```
# Build caches - exclude from Netlify secret scanning
.next/cache/
.turbo/
node_modules/.cache/

# Development files
.env.local
.env.*.local

# IDE
.cursor/
.windsurf/
.vscode/
.idea/
```

### 2. Configure Netlify Build Processing

Updated `netlify.toml` for each app to skip processing build caches:

```toml
[build.processing]
  skip_processing = false

[build.processing.skip_paths]
  # Skip secret scanning in build caches
  paths = [
    ".next/cache/**",
    ".turbo/**",
    "node_modules/**"
  ]
```

### 3. Clean Existing Caches

Run this command to clean build caches:

```bash
# Clean all apps
bun run clean:workspaces

# Or clean individual app
cd apps/admin && rm -rf .next/cache .netlify .turbo
```

## Security Best Practices

### For Client-Side API Keys (NEXT*PUBLIC*\*)

Client-side API keys **must** be restricted in Google Cloud Console:

1. **Application Restrictions**:
   - HTTP referrers (websites)
   - Add your production domains (e.g., `*.netlify.app`, `yourdomain.com`)

2. **API Restrictions**:
   - Restrict to specific APIs (e.g., Maps JavaScript API, Places API)

3. **Monitoring**:
   - Set up quotas and alerts in Google Cloud Console
   - Monitor API usage regularly

### For Server-Side API Keys

Server-side keys should **NOT** use the `NEXT_PUBLIC_` prefix:

```typescript
// ❌ BAD - Exposed to client
const API_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;

// ✅ GOOD - Server-side only
const API_KEY = process.env.SECRET_KEY;
```

## Environment Variables

### Admin App

Required environment variables (add to `.env.local`):

```bash
# Google Maps API Key (client-side - must be restricted)
NEXT_PUBLIC_GOOGLE_MAP_KEY=AIza...

# Other API keys (server-side - no NEXT_PUBLIC_ prefix)
API_SECRET_KEY=...
```

### Grower App

```bash
# Mapbox (client-side)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=...

# Backend API
NEXT_PUBLIC_API_BASE_URL=...
```

### Buyer App

Similar to Grower App - uses Mapbox for location features.

## Preventing Future Issues

### 1. Always Use .netlifyignore

Ensure each app has a `.netlifyignore` file to exclude:

- Build caches (`.next/cache/`, `.turbo/`)
- Development files (`.env.local`)
- IDE directories

### 2. Configure netlify.toml Properly

Use `[build.processing.skip_paths]` to exclude directories from secret scanning.

### 3. Restrict API Keys

**Never** deploy unrestricted API keys, even if they're client-side:

- Always add domain restrictions
- Always add API restrictions
- Set up usage quotas

### 4. Use Environment Variables

Never hardcode API keys in source code:

```typescript
// ❌ BAD
const API_KEY = "AIzaSyDx...";

// ✅ GOOD
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY;
```

### 5. Monitor Build Logs

Review Netlify build logs for secret scanning warnings. If a key is detected:

1. Verify it's a client-side key that should be public
2. Ensure proper restrictions are in place
3. Update `.netlifyignore` or `netlify.toml` if needed

## Deployment Checklist

Before deploying to Netlify:

- [ ] `.netlifyignore` exists in app directory
- [ ] `netlify.toml` includes `[build.processing.skip_paths]`
- [ ] Client-side API keys have domain restrictions
- [ ] Server-side secrets don't use `NEXT_PUBLIC_` prefix
- [ ] Environment variables are set in Netlify dashboard
- [ ] Build caches are excluded from git (`.gitignore`)

## Testing

After making these changes:

1. Clean build caches: `bun run clean:workspaces`
2. Test local build: `bun run build`
3. Deploy to Netlify
4. Verify no secret scanning warnings in build logs
5. Test that Google Maps features still work

## Additional Resources

- [Netlify Build Configuration](https://docs.netlify.com/configure-builds/file-based-configuration/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Google Maps API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Netlify Secret Scanning](https://docs.netlify.com/security/secret-scanning/)

## Related Files

- `apps/admin/.netlifyignore`
- `apps/admin/netlify.toml`
- `apps/admin/src/components/input-components/location-input.tsx`
- `apps/grower/.netlifyignore`
- `apps/grower/netlify.toml`
- `apps/buyer/.netlifyignore`
- `apps/buyer/netlify.toml`
