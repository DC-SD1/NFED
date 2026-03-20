# Grower Platform

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