import * as React from "react";

export function useIsMobile(maxWidth = 768) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${maxWidth - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < maxWidth);
    };

    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < maxWidth); // ← Use the passed value here too

    return () => mql.removeEventListener("change", onChange);
  }, [maxWidth]); // ← Add this to re-run if maxWidth changes

  return !!isMobile;
}
