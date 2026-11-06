"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMessages } from "@/hooks/useLocale";

/** Quietly offers to skip a long animation, and leaves once it has finished. */
export function SkipButton({ show, onSkip }: { show: boolean; onSkip: () => void }) {
  const { ui } = useMessages();
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={onSkip}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="fixed right-3 z-50 min-h-11 cursor-pointer px-3 text-xs text-champagne/45 ltr:text-[0.65rem] ltr:tracking-[0.25em] transition-colors hover:text-champagne/80"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
        >
          {ui.skip}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
