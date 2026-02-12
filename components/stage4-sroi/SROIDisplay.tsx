"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface SROIDisplayProps {
  ratio: number;
}

export function SROIDisplay({ ratio }: SROIDisplayProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Counter animation: count from 0 to ratio over 1.5s
  useEffect(() => {
    if (ratio <= 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 1500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(eased * ratio);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [ratio]);

  if (ratio <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-8 text-center"
    >
      {/* Gold glow effect */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(245,158,11,0.20) 0%, transparent 70%)",
        }}
      />

      <p className="relative text-sm font-medium text-white/60">
        Social Return on Investment
      </p>

      <p className="relative mt-3 font-heading text-[48px] font-bold leading-none text-[#F59E0B]">
        ₹{displayValue.toFixed(2)}
      </p>

      <p className="relative mt-4 text-base text-white/80">
        Every{" "}
        <span className="font-semibold text-white">₹1</span> invested created{" "}
        <span className="font-bold text-[#F59E0B]">
          ₹{ratio.toFixed(2)}
        </span>{" "}
        of social value
      </p>
    </motion.div>
  );
}
