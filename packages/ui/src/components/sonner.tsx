"use client";

import { useTheme } from "next-themes";
import type { ToasterProps } from "sonner";
import { toast, Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  // Use the default warning icon (triangle) for error toasts
  const defaultIcons = {
    error: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        height="20"
        width="20"
      >
        <path
          fillRule="evenodd"
          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group flex justify-center"
      toastOptions={{ className: "w-fit" }}
      icons={{
        error: defaultIcons.error,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "#008744",
          "--success-text": "#FFFFFF",
          "--error-bg": "#BA1A1A",
          "--error-text": "#FFFFFF",
          "--info-bg": "#0063EA",
          "--info-text": "#FFFFFF",
          "--border-radius": "12px",
          fontFamily:
            'FontSans, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, "Apple Color Emoji", "Segoe UI Emoji"',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { toast, Toaster };
