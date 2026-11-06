"use client";

import { motion } from "framer-motion";
import { CINEMATIC_EASE } from "@/lib/animations";

/** A slow fade and scale between scenes, like a camera easing into the next shot. */
export function SceneTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease: CINEMATIC_EASE }}
    >
      {children}
    </motion.div>
  );
}
