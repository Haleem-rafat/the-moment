"use client";

import { createContext, useContext } from "react";

export interface AudioApi {
  muted: boolean;
  /** Must be called from a tap or click, because browsers block audio otherwise. */
  start: () => void;
  toggleMute: () => void;
  setMusicLevel: (level: number, fadeMs?: number) => void;
  /** The short piece that plays once as the ring box opens. */
  playRingMusic: () => void;
  fadeRingMusic: () => void;
  playZaghrouta: () => void;
  /** Stays silent until sound has been unlocked by a tap. */
  playDodge: () => void;
  /** One camera click. Stays silent until sound has been unlocked by a tap. */
  playShutter: () => void;
  /** The soft sound of a touch. */
  playTap: () => void;
  /** Keyboard sound for text that is appearing. Stays silent until sound has been unlocked by a tap. */
  startTyping: () => void;
  stopTyping: () => void;
}

export const AudioContextValue = createContext<AudioApi | null>(null);

export function useAudio() {
  const api = useContext(AudioContextValue);
  if (!api) throw new Error("useAudio must be used inside AudioController");
  return api;
}
