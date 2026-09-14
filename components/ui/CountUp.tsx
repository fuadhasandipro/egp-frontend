'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  /** Final value to count to. */
  value: number;
  /** Animation length in milliseconds. */
  duration?: number;
  /** Rendered after the number, e.g. "%". */
  suffix?: string;
}

/**
 * Counts from the previously shown value up to `value`.
 *
 * Uses requestAnimationFrame rather than setInterval so the steps line up with
 * the browser's repaint and the number never stutters. Animation is skipped
 * when the user has asked the OS for reduced motion.
 */
export default function CountUp({ value, duration = 900, suffix = '' }: CountUpProps) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const from = fromRef.current;
    if (prefersReduced || from === value) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }

    const start = performance.now();
    // easeOutCubic: fast at first, settling gently on the final number.
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(from + (value - from) * ease(progress)));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}
