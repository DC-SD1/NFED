import { useCallback, useEffect, useState } from "react"

interface ScrollState {
  x: number
  y: number
  isScrollingUp: boolean
  isScrollingDown: boolean
}

export function useScroll(threshold = 0) {
  const [scrollState, setScrollState] = useState<ScrollState>({
    x: 0,
    y: 0,
    isScrollingUp: false,
    isScrollingDown: false,
  })

  const [lastScrollY, setLastScrollY] = useState(0)

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    const currentScrollX = window.scrollX

    setScrollState({
      x: currentScrollX,
      y: currentScrollY,
      isScrollingUp: currentScrollY < lastScrollY && currentScrollY > threshold,
      isScrollingDown: currentScrollY > lastScrollY && currentScrollY > threshold,
    })

    setLastScrollY(currentScrollY)
  }, [lastScrollY, threshold])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  return scrollState
}