"use client";

import { motion } from "framer-motion";

/** A drawn ring for devices without 3D graphics, so the finale still works everywhere. */
export function RingFallback({ open }: { open: boolean }) {
  return (
    <div className="absolute inset-x-0 top-[6dvh] flex justify-center">
      <motion.svg
        viewBox="0 0 240 260"
        className="h-[38dvh]"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: open ? 1 : 0.4, scale: 1 }}
        transition={{ duration: 2 }}
        aria-hidden
      >
        <defs>
          <linearGradient id="fallback-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f6dcc0" />
            <stop offset="0.5" stopColor="#a77b63" />
            <stop offset="1" stopColor="#ecc7a4" />
          </linearGradient>
          <radialGradient id="fallback-glow">
            <stop offset="0" stopColor="#ffdca8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffdca8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="120" cy="100" r="100" fill="url(#fallback-glow)" />
        <rect x="35" y="170" width="170" height="74" rx="10" fill="#4f1329" />
        <rect x="45" y="164" width="150" height="16" rx="6" fill="#efe3d3" />
        <circle cx="120" cy="120" r="46" fill="none" stroke="url(#fallback-gold)" strokeWidth="7" />
        <path d="M120 44 L140 62 L120 88 L100 62 Z" fill="#fff" stroke="#e9dccb" strokeWidth="1" />
        <path d="M100 62 H140 M112 62 L120 88 L128 62 M112 62 L120 44 L128 62" stroke="#c9d3dc" strokeWidth="0.8" fill="none" />
      </motion.svg>
    </div>
  );
}
