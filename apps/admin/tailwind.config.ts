import baseConfig from "@cf/tailwind-config";
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [baseConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        heading: ["var(--font-heading)", ...fontFamily.sans],
      },
      colors: {
        sidebar: "hsl(var(--sidebar))",
        "btn-hover": "hsl(var(--btn-bg-hover))",
        "error-color": "hsl(var(--error-color))",
        "success-secondary": "hsl(var(--success-secondary))",
        "error-container-light": "hsl(var(--error-container-light))",
        "error-container": "hsl(var(--error-container))",
      },
      boxShadow: {
        "custom-login": "0px 2px 20px 0px rgba(22, 29, 20, 0.12)",
        "custom-card": "0px 1px 6px 0px rgba(22, 29, 20, 0.16)",
      },
    },
  },
} satisfies Config;
