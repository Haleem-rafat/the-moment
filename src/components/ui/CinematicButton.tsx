"use client";

import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

interface CinematicButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  /** Hidden buttons keep their space, so the layout doesn't jump when they appear. */
  show?: boolean;
  variant?: "primary" | "quiet";
}

export function CinematicButton({
  children,
  onClick,
  show = true,
  variant = "primary",
}: CinematicButtonProps) {
  const primary = variant === "primary";
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!show}
      tabIndex={show ? 0 : -1}
      aria-hidden={!show}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
      transition={fadeIn}
      whileHover={
        show ? { scale: 1.03, boxShadow: "0 0 34px rgb(167 123 99 / 0.55)" } : undefined
      }
      whileTap={show ? { scale: 0.97 } : undefined}
      className={`min-h-12 cursor-pointer rounded-full border px-8 py-3 text-sm font-medium transition-colors ltr:text-xs ltr:tracking-[0.28em] disabled:pointer-events-none ${
        primary
          ? "border-rose-gold bg-rose-gold/10 text-champagne shadow-[0_0_20px_rgb(167_123_99/0.25)] hover:bg-rose-gold/25"
          : "border-champagne/25 text-champagne/80 hover:border-champagne/50"
      }`}
    >
      {children}
    </motion.button>
  );
}
