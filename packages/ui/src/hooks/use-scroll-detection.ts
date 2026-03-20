"use client";

import { useEffect, useState } from "react";

/**
 * Detects if the page has been scrolled a few pixels from the top.
 * Returns true if the scroll position is greater than the threshold (default: 2px).
 */
export const useScrollDetection = (threshold = 2) => {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      setHasScrolled(scrollTop > threshold);
    };

    // Check on mount in case the page is already scrolled
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return hasScrolled;
};
