"use client";

import { useEffect, useState, useRef } from "react";

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number; // in seconds
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  separator?: string;
}

export default function CountUp({
  to,
  from = 0,
  duration = 1.2,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  separator = ",",
}: CountUpProps) {
  const [current, setCurrent] = useState(from);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const startVal = from;
    const endVal = to;
    const durationMs = duration * 1000;

    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = easeOutExpo(progress);

      const nextVal = startVal + (endVal - startVal) * easedProgress;
      setCurrent(nextVal);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(endVal);
      }
    };

    startTimeRef.current = null;
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [to, from, duration]);

  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    const [intPart, decPart] = fixed.split(".");
    const withSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decPart ? `${withSeparator}.${decPart}` : withSeparator;
  };

  return (
    <span className={`rb-count-up ${className}`}>
      {prefix}
      {formatNumber(current)}
      {suffix}
    </span>
  );
}
