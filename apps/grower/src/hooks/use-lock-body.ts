import { useEffect, useLayoutEffect } from "react"

// Use useLayoutEffect on the client, useEffect on the server
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

export function useLockBody() {
  useIsomorphicLayoutEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = "hidden"
    
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])
}