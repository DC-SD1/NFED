#!/bin/bash

# CF Monorepo App Scaffolding Script
# Creates new apps with proper configuration and integration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TEMPLATE_DIR="$SCRIPT_DIR/templates"
HELPERS_DIR="$SCRIPT_DIR/helpers"

# Variables
APP_NAME=""
APP_TYPE=""
SELECTED_FEATURES=()
TEMP_DIR=""

# Function to print colored output
print_color() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to validate app name
validate_app_name() {
    local name=$1
    
    # Check if name is empty
    if [[ -z "$name" ]]; then
        print_color "$RED" "Error: App name cannot be empty"
        return 1
    fi
    
    # Check if name follows conventions (lowercase, hyphens)
    if ! [[ "$name" =~ ^[a-z][a-z0-9-]*$ ]]; then
        print_color "$RED" "Error: App name must start with a letter and contain only lowercase letters, numbers, and hyphens"
        return 1
    fi
    
    # Check if directory already exists
    if [[ -d "apps/$name" ]]; then
        print_color "$RED" "Error: Directory apps/$name already exists"
        return 1
    fi
    
    return 0
}

# Function to prompt for app name
prompt_app_name() {
    while true; do
        read -p "Enter app name (e.g., 'admin-dashboard'): " APP_NAME
        
        if validate_app_name "$APP_NAME"; then
            print_color "$GREEN" "✓ Valid app name: $APP_NAME"
            break
        else
            print_color "$YELLOW" "Please enter a valid app name"
        fi
    done
}

# Function to select app type
select_app_type() {
    print_color "$BLUE" "\nSelect app type:"
    echo "1) Next.js Full-Stack Application"
    echo "2) API Service (Nitro/H3)"
    echo "3) Next.js API-Only"
    echo "4) Static Site (Next.js SSG)"
    
    while true; do
        read -p "Enter choice (1-4): " choice
        case $choice in
            1)
                APP_TYPE="nextjs-fullstack"
                print_color "$GREEN" "✓ Selected: Next.js Full-Stack Application"
                break
                ;;
            2)
                APP_TYPE="service"
                print_color "$GREEN" "✓ Selected: API Service"
                break
                ;;
            3)
                APP_TYPE="nextjs-api"
                print_color "$GREEN" "✓ Selected: Next.js API-Only"
                break
                ;;
            4)
                APP_TYPE="nextjs-static"
                print_color "$GREEN" "✓ Selected: Static Site"
                break
                ;;
            *)
                print_color "$YELLOW" "Please enter a valid choice (1-4)"
                ;;
        esac
    done
}

# Function to select features
select_features() {
    if [[ "$APP_TYPE" == "service" ]]; then
        # Limited features for service apps
        print_color "$BLUE" "\nSelect features for service app:"
        echo "Available features:"
        echo "1) JWT Authentication"
        echo "2) Basic Monitoring"
        echo "3) Logger (@cf/logger)"
        echo ""
        read -p "Enter feature numbers separated by spaces (e.g., '1 3'), or press Enter for none: " feature_input
        
        for num in $feature_input; do
            case $num in
                1) SELECTED_FEATURES+=("service-auth") ;;
                2) SELECTED_FEATURES+=("service-monitoring") ;;
                3) SELECTED_FEATURES+=("logger") ;;
            esac
        done
    else
        # Full features for Next.js apps
        print_color "$BLUE" "\nSelect features for Next.js app:"
        echo "Available features:"
        echo "1) Authentication (Clerk)"
        echo "2) Internationalization (next-intl)"
        echo "3) Error Monitoring (Sentry)"
        echo "4) Analytics (PostHog)"
        echo "5) UI Components (@cf/ui + Tailwind)"
        echo "6) State Management (Zustand)"
        echo "7) Forms (react-hook-form + zod)"
        echo "8) API Client (@cf/api)"
        echo "9) Logger (@cf/logger)"
        echo ""
        read -p "Enter feature numbers separated by spaces (e.g., '1 2 5 8'), or press Enter for none: " feature_input
        
        for num in $feature_input; do
            case $num in
                1) SELECTED_FEATURES+=("auth") ;;
                2) SELECTED_FEATURES+=("i18n") ;;
                3) SELECTED_FEATURES+=("sentry") ;;
                4) SELECTED_FEATURES+=("posthog") ;;
                5) SELECTED_FEATURES+=("ui") ;;
                6) SELECTED_FEATURES+=("state") ;;
                7) SELECTED_FEATURES+=("forms") ;;
                8) SELECTED_FEATURES+=("api-client") ;;
                9) SELECTED_FEATURES+=("logger") ;;
            esac
        done
    fi
    
    if [[ ${#SELECTED_FEATURES[@]} -gt 0 ]]; then
        print_color "$GREEN" "✓ Selected features: ${SELECTED_FEATURES[*]}"
    else
        print_color "$YELLOW" "No additional features selected"
    fi
}

# Function to show confirmation
show_confirmation() {
    print_color "$BLUE" "\n========== Configuration Summary =========="
    echo "App Name: $APP_NAME"
    echo "App Type: $APP_TYPE"
    echo "Features: ${SELECTED_FEATURES[*]:-None}"
    echo "Location: apps/$APP_NAME"
    print_color "$BLUE" "==========================================="
    
    read -p "Proceed with creation? (y/n): " confirm
    if [[ "$confirm" != "y" ]]; then
        print_color "$YELLOW" "Cancelled by user"
        exit 0
    fi
}

# Function to create temp directory
create_temp_dir() {
    TEMP_DIR="apps/.tmp-${APP_NAME}-$(date +%s)"
    mkdir -p "$TEMP_DIR"
    print_color "$BLUE" "Creating app in temporary directory..."
}

# Function to copy base template
copy_base_template() {
    local template_type=""
    
    case $APP_TYPE in
        "nextjs-fullstack"|"nextjs-api"|"nextjs-static")
            template_type="nextjs-app"
            ;;
        "service")
            template_type="service"
            ;;
    esac
    
    local base_dir="$TEMPLATE_DIR/$template_type/base"
    
    if [[ ! -d "$base_dir" ]]; then
        print_color "$YELLOW" "Base template not found, creating minimal structure..."
        create_minimal_structure
    else
        cp -r "$base_dir"/* "$TEMP_DIR/"
        print_color "$GREEN" "✓ Base template copied"
    fi
    
    # Replace placeholders
    find "$TEMP_DIR" -type f -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.mjs" | while read file; do
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/{{APP_NAME}}/$APP_NAME/g" "$file"
            sed -i '' "s/{{APP_DESCRIPTION}}/CF $APP_NAME application/g" "$file"
        else
            sed -i "s/{{APP_NAME}}/$APP_NAME/g" "$file"
            sed -i "s/{{APP_DESCRIPTION}}/CF $APP_NAME application/g" "$file"
        fi
    done
}

# Function to create minimal structure (fallback)
create_minimal_structure() {
    case $APP_TYPE in
        "nextjs-fullstack"|"nextjs-api"|"nextjs-static")
            create_nextjs_minimal
            ;;
        "service")
            create_service_minimal
            ;;
    esac
}

# Function to create minimal Next.js structure
create_nextjs_minimal() {
    # Create package.json
    cat > "$TEMP_DIR/package.json" << 'EOF'
{
  "name": "@cf/{{APP_NAME}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.1.8",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@cf/eslint-config": "workspace:*",
    "@cf/prettier-config": "workspace:*",
    "@cf/typescript-config": "workspace:*",
    "@types/node": "^20.12.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^15.1.8",
    "typescript": "^5.4.5"
  },
  "eslintConfig": {
    "root": true,
    "extends": [
      "@cf/eslint-config/base",
      "@cf/eslint-config/nextjs",
      "@cf/eslint-config/react"
    ]
  },
  "prettier": "@cf/prettier-config"
}
EOF

    # Create tsconfig.json
    cat > "$TEMP_DIR/tsconfig.json" << 'EOF'
{
  "extends": "@cf/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

    # Create next.config.mjs
    cat > "$TEMP_DIR/next.config.mjs" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

export default nextConfig;
EOF

    # Create basic app structure
    mkdir -p "$TEMP_DIR/src/app"
    
    cat > "$TEMP_DIR/src/app/layout.tsx" << 'EOF'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '{{APP_NAME}}',
  description: 'CF {{APP_NAME}} application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
EOF

    cat > "$TEMP_DIR/src/app/page.tsx" << 'EOF'
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to {{APP_NAME}}</h1>
      <p>Get started by editing src/app/page.tsx</p>
    </main>
  )
}
EOF

    # Create .env.example
    touch "$TEMP_DIR/.env.example"
    
    print_color "$GREEN" "✓ Created minimal Next.js structure"
}

# Function to create minimal service structure
create_service_minimal() {
    # Create package.json
    cat > "$TEMP_DIR/package.json" << 'EOF'
{
  "name": "@cf/{{APP_NAME}}",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nitro dev",
    "build": "nitro build",
    "preview": "node .output/server/index.mjs",
    "lint": "eslint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "h3": "^1.11.1"
  },
  "devDependencies": {
    "@cf/eslint-config": "workspace:*",
    "@cf/prettier-config": "workspace:*",
    "@cf/typescript-config": "workspace:*",
    "@types/node": "^20.12.12",
    "eslint": "^8.57.0",
    "nitropack": "^2.9.6",
    "typescript": "^5.4.5"
  },
  "eslintConfig": {
    "root": true,
    "extends": ["@cf/eslint-config/base"]
  },
  "prettier": "@cf/prettier-config"
}
EOF

    # Create tsconfig.json
    cat > "$TEMP_DIR/tsconfig.json" << 'EOF'
{
  "extends": "@cf/typescript-config/base.json",
  "compilerOptions": {
    "module": "ESNext",
    "target": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", ".output"]
}
EOF

    # Create nitro.config.ts
    cat > "$TEMP_DIR/nitro.config.ts" << 'EOF'
import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  srcDir: 'server'
})
EOF

    # Create basic server structure
    mkdir -p "$TEMP_DIR/server/api"
    
    cat > "$TEMP_DIR/server/api/health.ts" << 'EOF'
export default defineEventHandler(() => {
  return { status: 'ok', service: '{{APP_NAME}}' }
})
EOF

    # Create .env.example
    touch "$TEMP_DIR/.env.example"
    
    print_color "$GREEN" "✓ Created minimal service structure"
}

# Function to apply features
apply_features() {
    if [[ ${#SELECTED_FEATURES[@]} -eq 0 ]]; then
        return
    fi
    
    print_color "$BLUE" "Applying selected features..."
    
    for feature in "${SELECTED_FEATURES[@]}"; do
        apply_feature "$feature"
    done
}

# Function to apply a single feature
apply_feature() {
    local feature=$1
    local feature_dir=""
    
    # Determine feature directory
    case $APP_TYPE in
        "nextjs-fullstack"|"nextjs-api"|"nextjs-static")
            feature_dir="$TEMPLATE_DIR/nextjs-app/features/$feature"
            ;;
        "service")
            feature_dir="$TEMPLATE_DIR/service/features/$feature"
            ;;
    esac
    
    # For now, just add dependencies based on feature
    case $feature in
        "auth")
            add_auth_feature
            ;;
        "i18n")
            add_i18n_feature
            ;;
        "ui")
            add_ui_feature
            ;;
        "api-client")
            add_api_client_feature
            ;;
        "logger")
            add_logger_feature
            ;;
        *)
            print_color "$YELLOW" "Feature $feature not yet implemented"
            ;;
    esac
}

# Function to add auth feature
add_auth_feature() {
    print_color "$GREEN" "✓ Adding authentication (Clerk)..."
    
    # Update package.json with Clerk dependencies
    if [[ -f "$HELPERS_DIR/merge-package-json.js" ]]; then
        node "$HELPERS_DIR/merge-package-json.js" "$TEMP_DIR/package.json" '{
            "dependencies": {
                "@clerk/backend": "^2.1.0",
                "@clerk/nextjs": "^6.22.0"
            }
        }'
    fi
    
    # Add to .env.example
    cat >> "$TEMP_DIR/.env.example" << 'EOF'

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
EOF
}

# Function to add i18n feature
add_i18n_feature() {
    print_color "$GREEN" "✓ Adding internationalization (next-intl)..."
    
    # Update package.json
    if [[ -f "$HELPERS_DIR/merge-package-json.js" ]]; then
        node "$HELPERS_DIR/merge-package-json.js" "$TEMP_DIR/package.json" '{
            "dependencies": {
                "next-intl": "^4.3.4"
            }
        }'
    fi
    
    # Create dictionaries directory in src/config (matching existing pattern)
    mkdir -p "$TEMP_DIR/src/config/dictionaries"
    echo '{"common": {"welcome": "Welcome"}}' > "$TEMP_DIR/src/config/dictionaries/en.json"
    echo '{"common": {"welcome": "Bienvenido"}}' > "$TEMP_DIR/src/config/dictionaries/es.json"
    echo '{"common": {"welcome": "Bienvenue"}}' > "$TEMP_DIR/src/config/dictionaries/fr.json"
    
    # Create i18n configuration
    mkdir -p "$TEMP_DIR/src/i18n"
    
    # Create routing.ts for i18n
    cat > "$TEMP_DIR/src/i18n/routing.ts" << 'EOF'
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'es', 'fr'],
  defaultLocale: 'en'
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
EOF
    
    # Create request.ts for i18n
    cat > "$TEMP_DIR/src/i18n/request.ts" << 'EOF'
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  if (!locale) {
    locale = routing.defaultLocale;
  }

  if (!locale || !hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../config/dictionaries/${locale}.json`)).default
  };
});
EOF

    # Update next.config.mjs for i18n
    if [[ -f "$TEMP_DIR/next.config.mjs" ]]; then
        # Create a new next.config.mjs with i18n support
        cat > "$TEMP_DIR/next.config.mjs" << 'EOF'
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

export default withNextIntl(nextConfig);
EOF
    fi
    
    # Restructure app directory for [locale]
    if [[ -d "$TEMP_DIR/src/app" ]]; then
        # Create [locale] directory
        mkdir -p "$TEMP_DIR/src/app/[locale]"
        
        # Move page.tsx to [locale] if it exists
        if [[ -f "$TEMP_DIR/src/app/page.tsx" ]]; then
            mv "$TEMP_DIR/src/app/page.tsx" "$TEMP_DIR/src/app/[locale]/page.tsx"
        fi
        
        # Move layout.tsx to [locale] and update it
        if [[ -f "$TEMP_DIR/src/app/layout.tsx" ]]; then
            # Create root layout that doesn't use i18n
            cat > "$TEMP_DIR/src/app/layout.tsx" << 'EOF'
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '{{APP_NAME}}',
  description: 'CF {{APP_NAME}} application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
EOF
            
            # Create [locale] layout with i18n support
            cat > "$TEMP_DIR/src/app/[locale]/layout.tsx" << 'EOF'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
EOF
        fi
        
        # Create middleware for i18n
        cat > "$TEMP_DIR/src/middleware.ts" << 'EOF'
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(en|es|fr)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};
EOF
    fi
}

# Function to add UI feature
add_ui_feature() {
    print_color "$GREEN" "✓ Adding UI components (@cf/ui + Tailwind)..."
    
    # Update package.json
    if [[ -f "$HELPERS_DIR/merge-package-json.js" ]]; then
        node "$HELPERS_DIR/merge-package-json.js" "$TEMP_DIR/package.json" '{
            "dependencies": {
                "@cf/ui": "workspace:*"
            },
            "devDependencies": {
                "@cf/tailwind-config": "workspace:*",
                "autoprefixer": "^10.4.17",
                "postcss": "^8.4.38",
                "tailwindcss": "^3.4.1"
            }
        }'
    fi
    
    # Create tailwind.config.ts
    cat > "$TEMP_DIR/tailwind.config.ts" << 'EOF'
import type { Config } from "tailwindcss";
import baseConfig from "@cf/tailwind-config";

const config: Config = {
  ...baseConfig,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
};

export default config;
EOF

    # Create postcss.config.mjs
    cat > "$TEMP_DIR/postcss.config.mjs" << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
}

# Function to add API client feature
add_api_client_feature() {
    print_color "$GREEN" "✓ Adding API client (@cf/api)..."
    
    if [[ -f "$HELPERS_DIR/merge-package-json.js" ]]; then
        node "$HELPERS_DIR/merge-package-json.js" "$TEMP_DIR/package.json" '{
            "dependencies": {
                "@cf/api": "workspace:*"
            }
        }'
    fi
    
    # Add to .env.example
    cat >> "$TEMP_DIR/.env.example" << 'EOF'

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
EOF
}

# Function to add logger feature
add_logger_feature() {
    print_color "$GREEN" "✓ Adding logger (@cf/logger)..."
    
    if [[ -f "$HELPERS_DIR/merge-package-json.js" ]]; then
        node "$HELPERS_DIR/merge-package-json.js" "$TEMP_DIR/package.json" '{
            "dependencies": {
                "@cf/logger": "workspace:*"
            }
        }'
    fi
}

# Function to finalize app creation
finalize_creation() {
    # Move from temp to final location
    mv "$TEMP_DIR" "apps/$APP_NAME"
    
    print_color "$GREEN" "✓ App created at apps/$APP_NAME"
    
    # Install dependencies
    print_color "$BLUE" "Installing dependencies..."
    cd "apps/$APP_NAME"
    bun install
    
    cd - > /dev/null
    
    print_color "$GREEN" "\n✅ App created successfully!"
    print_color "$BLUE" "📁 Location: apps/$APP_NAME"
    echo ""
    print_color "$BLUE" "🚀 Next steps:"
    echo "  1. cd apps/$APP_NAME"
    echo "  2. Copy .env.example to .env.local and configure"
    echo "  3. bun run dev"
    echo ""
    
    if [[ ${#SELECTED_FEATURES[@]} -gt 0 ]]; then
        print_color "$BLUE" "📝 Selected features:"
        for feature in "${SELECTED_FEATURES[@]}"; do
            echo "  - $feature"
        done
    fi
}

# Function to cleanup on error
cleanup() {
    if [[ -n "$TEMP_DIR" ]] && [[ -d "$TEMP_DIR" ]]; then
        rm -rf "$TEMP_DIR"
        print_color "$YELLOW" "Cleaned up temporary files"
    fi
}

# Set up error handling
trap cleanup ERR

# Main execution
main() {
    print_color "$BLUE" "╔════════════════════════════════════╗"
    print_color "$BLUE" "║   CF Monorepo App Scaffolding      ║"
    print_color "$BLUE" "╚════════════════════════════════════╝"
    echo ""
    
    prompt_app_name
    select_app_type
    select_features
    show_confirmation
    
    create_temp_dir
    copy_base_template
    apply_features
    finalize_creation
}

# Run main function
main