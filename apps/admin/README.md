# Admin Platform

Complete Farmer's digital platform for modern farming - Track, manage, and optimize your agricultural operations.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dynamic theming
- **Authentication**: Clerk with custom UI
- **Internationalization**: next-intl with [lang] routing
- **API Integration**: OpenAPI TypeScript

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in your Clerk keys and API configuration.

3. Generate API types (when you have an OpenAPI spec):

   ```bash
   npm run generate:api-types
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/
│   ├── [lang]/
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (dashboard)/    # Protected dashboard routes
│   │   └── (marketing)/    # Public marketing pages
│   ├── layout.tsx          # Root layout
│   └── robots.ts           # SEO robots configuration
├── components/
│   ├── ui/                 # Reusable UI components
│   └── theme-provider.tsx  # Theme management
├── config/
│   ├── i18n-config.ts      # i18n configuration
│   └── site.ts             # Site metadata
├── hooks/                  # Custom React hooks
├── lib/
│   ├── api/                # API client and types
│   └── utils.ts            # Utility functions
└── styles/
    └── globals.css         # Global styles with CSS variables
```

## Features

- 🌍 **Multi-language Support**: English, Spanish, and French
- 🎨 **Dynamic Theming**: Light/dark mode with CSS variables
- 🔐 **Secure Authentication**: Clerk integration with custom UI
- 📱 **Responsive Design**: Mobile-first approach
- 🚀 **Type-safe API**: OpenAPI TypeScript integration
- ⚡ **Performance**: Next.js 15 with React Server Components

## Development

- Run linting: `npm run lint`
- Type checking: `npm run typecheck`
- Build for production: `npm run build`

## Mock Data Mode (Development Only)

For development and QA testing, you can toggle mock data mode for buyer listings.

**Important**: Mock data is ONLY used when explicitly enabled. When disabled, the app uses real API data (or shows appropriate empty states if the API is not ready).

### Using the UI Toggle

In development mode, a floating toggle button appears in the bottom-right corner:

1. **Enable Mock Data**: Click the "Enable Mock Data" button
2. **Disable Mock Data**: Click the amber badge showing "Mock Data: ON"

When mock data is active:

- An amber badge (🧪 Mock Data Mode) appears in the page header
- All data comes from the mock dataset (`src/lib/constants/mock_data.ts`)
- Filters, search, and pagination work on mock data

When mock data is disabled:

- App attempts to use real API data
- Toggle state resets on page reload
- A helpful tooltip appears suggesting to enable mock mode

### Mock Data Location

All mock data is centralized in `src/lib/constants/mock_data.ts`:

```typescript
export const MOCK_BUYERS: Buyer[] = [...];
// Future: export const MOCK_GROWERS: Grower[] = [];
```

### Features

- **Simple Toggle**: Click to enable/disable
- **Visual Indicators**: Clear badges and messages show current mode
- **Dev-Only**: Toggle only appears in development mode
- **Centralized Data**: Single source of truth for all mock data
- **Clear Separation**: No automatic fallback to mock data when API fails
