"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook for managing countdown timers with disabled state.
 * @param initialSeconds Seconds the countdown should start from.
 * @returns Countdown state and control functions.
 */
export function useCountdownTimer(initialSeconds: number) {
  const [countdown, setCountdown] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);

  // Keep a mutable reference to the interval id so we can clear it any time.
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Helpers ------------------------------------------------------------
  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // --- Public API ---------------------------------------------------------
  const startCountdown = useCallback(() => {
    // Restart: clear any existing timer first.
    clearTimer();
    setCountdown(initialSeconds);
    setIsDisabled(true);

    timerRef.current = setInterval(() => {
      // Use functional update to avoid stale state.
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1_000);
  }, [initialSeconds, clearTimer]);

  const resetCountdown = useCallback(() => {
    clearTimer();
    setCountdown(0);
    setIsDisabled(false);
  }, [clearTimer]);

  // Cleanup on unmount to prevent memory leaks.
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  return {
    countdown,
    isDisabled,
    startCountdown,
    resetCountdown,
  };
}
