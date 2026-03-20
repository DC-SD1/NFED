"use client";

// Simple global concurrency manager for live maps
// Limits number of concurrently mounted WebGL maps

export type ReleaseFn = () => void;

interface Gate {
  max: number;
  count: number;
  queue: (() => void)[];
}

const getGate = (): Gate => {
  if (typeof window === "undefined") {
    return { max: 8, count: 0, queue: [] }; // Reduced to 8 to be safer
  }
  const w = window as any;
  if (!w.__cf_map_gate__) {
    w.__cf_map_gate__ = { max: 8, count: 0, queue: [] } as Gate;
  }
  return w.__cf_map_gate__ as Gate;
};

export function setMaxLiveMaps(max: number) {
  const gate = getGate();
  gate.max = Math.max(1, max);
}

export async function acquireLiveSlot(): Promise<ReleaseFn> {
  const gate = getGate();
  return new Promise<ReleaseFn>((resolve) => {
    const grant = () => {
      gate.count++;
      console.log(
        `[MapConcurrency] Slot granted. Active: ${gate.count}/${gate.max}, Queue: ${gate.queue.length}`,
      );

      const release = () => {
        gate.count = Math.max(0, gate.count - 1);
        console.log(
          `[MapConcurrency] Slot released. Active: ${gate.count}/${gate.max}, Queue: ${gate.queue.length}`,
        );

        // Process ALL waiting requests up to the available slots
        while (gate.queue.length > 0 && gate.count < gate.max) {
          const next = gate.queue.shift();
          if (next) {
            console.log(`[MapConcurrency] Processing queued request`);
            next();
          }
        }
      };
      resolve(release);
    };

    if (gate.count < gate.max) {
      grant();
    } else {
      console.log(
        `[MapConcurrency] Max slots reached, queueing request. Queue size: ${gate.queue.length + 1}`,
      );
      gate.queue.push(grant);
    }
  });
}

export function getGateStatus() {
  const gate = getGate();
  return {
    active: gate.count,
    max: gate.max,
    queued: gate.queue.length,
  };
}
