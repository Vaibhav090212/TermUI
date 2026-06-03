import { useEffect, useRef } from '../hooks.js';

export function useUpdateEffect(
  effect: () => void | (() => void),
  deps?: unknown[]
): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the very first render, but flip the guard for next time
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // On all subsequent renders, run the effect normally
    return effect();
  }, deps);
}