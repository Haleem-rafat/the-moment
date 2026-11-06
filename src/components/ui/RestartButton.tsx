"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useMessages } from "@/hooks/useLocale";

const CONFIRM_MS = 3000;

/** Clears all progress and starts the story over. It asks once, so a stray tap can't lose her place. */
export function RestartButton() {
  const { ui } = useMessages();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [armed]);

  const restart = () => {
    if (!armed) {
      setArmed(true);
      return;
    }
    try {
      sessionStorage.clear();
    } catch {
      // Storage can be blocked; the reload below still returns to the start.
    }
    window.location.replace(window.location.pathname);
  };

  return (
    <button
      type="button"
      data-restart
      onClick={restart}
      className="flex min-h-11 cursor-pointer items-center gap-1.5 px-3 text-xs text-champagne/70 transition-colors hover:text-champagne"
    >
      <RotateCcw size={14} strokeWidth={1.5} />
      {armed ? ui.restartConfirm : ui.restart}
    </button>
  );
}
