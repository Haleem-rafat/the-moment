"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMessages } from "@/hooks/useLocale";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}

export function Dialog({ open, onClose, label, children }: DialogProps) {
  const { ui } = useMessages();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Rendered on <body> so it sits above the sound toggle and scene layers.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-midnight/90 p-5 backdrop-blur-sm"
        >
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label={ui.close}
            className="absolute right-2 flex size-11 cursor-pointer items-center justify-center text-champagne/70 hover:text-champagne"
            style={{ top: "calc(env(safe-area-inset-top) + 0.5rem)" }}
          >
            <X size={22} strokeWidth={1.5} />
          </button>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.72, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
