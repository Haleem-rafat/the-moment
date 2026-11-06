"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/hooks/useAudio";
import { useMessages } from "@/hooks/useLocale";

export function SoundToggle() {
  const { muted, toggleMute } = useAudio();
  const { ui } = useMessages();
  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? ui.soundOn : ui.soundOff}
      aria-pressed={muted}
      className="flex size-11 cursor-pointer items-center justify-center text-champagne/60 transition-colors hover:text-champagne"
    >
      {muted ? <VolumeX size={18} strokeWidth={1.5} /> : <Volume2 size={18} strokeWidth={1.5} />}
    </button>
  );
}
