"use client";

import { createContext, useContext } from "react";

export interface AudioApi {
  muted: boolean;
  /** Must be called from a tap or click, because browsers block audio otherwise. */
  start: () => void;
  toggleMute: () => void;
  setMusicLevel: (level: number, fadeMs?: number) => void;
  /** Plays the voice message. Resolves false straight away if there is no file. */
  playVoice: () => Promise<boolean>;
  stopVoice: () => void;
  /** The short piece that plays once as the ring box opens. */
  playRingMusic: () => void;
  fadeRingMusic: () => void;
}

export const AudioContextValue = createContext<AudioApi | null>(null);

export function useAudio() {
  const api = useContext(AudioContextValue);
  if (!api) throw new Error("useAudio must be used inside AudioController");
  return api;
}
