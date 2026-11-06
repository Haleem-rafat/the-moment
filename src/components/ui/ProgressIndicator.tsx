"use client";

import { motion } from "framer-motion";
import { useMessages } from "@/hooks/useLocale";

interface ProgressIndicatorProps {
  index: number;
  furthest: number;
  onSelect: (index: number) => void;
}

/**
 * Lights only the scenes she has reached, so it never shows how many remain.
 * Tapping a lit point returns to that scene.
 */
export function ProgressIndicator({ index, furthest, onSelect }: ProgressIndicatorProps) {
  const { ui } = useMessages();
  return (
    <nav aria-label={ui.progress} className="flex items-center">
      {Array.from({ length: furthest + 1 }, (_, i) => (
        <motion.button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`${ui.backTo} ${i + 1}`}
          aria-current={i === index ? "step" : undefined}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex size-7 cursor-pointer items-center justify-center"
        >
          <span
            className={`block rounded-full transition-all duration-700 ${
              i === index
                ? "size-2 bg-champagne shadow-[0_0_10px_rgb(233_220_203/0.8)]"
                : "size-1.5 bg-rose-gold/60"
            }`}
          />
        </motion.button>
      ))}
    </nav>
  );
}
