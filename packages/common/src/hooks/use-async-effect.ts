"use client";

import type { DependencyList } from "react";
import * as React from "react";

export function useAsyncEffect(
  effect: () => Promise<void | (() => Promise<void> | void)>,
  deps?: DependencyList,
) {
  const destroyRef = React.useRef<
    void | (() => Promise<void> | void) | undefined
  >(undefined);

  React.useEffect(() => {
    const e = effect();

    async function execute() {
      destroyRef.current = await e;
    }

    void execute();

    return () => {
      if (typeof destroyRef.current === "function") {
        void destroyRef.current();
      }
    };
  }, deps);
}
