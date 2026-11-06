"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Howl as HowlType } from "howler";
import { AudioContextValue, type AudioApi } from "@/hooks/useAudio";
import { createAmbientSynth, type AmbientSynth } from "@/lib/ambientSynth";
import { MUSIC_LEVEL } from "@/lib/constants";
import { proposal } from "@/data/proposal";

export function AudioController({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(false);
  const music = useRef<HowlType | null>(null);
  const ringMusic = useRef<HowlType | null>(null);
  const typing = useRef<HowlType | null>(null);
  const shutter = useRef<HowlType | null>(null);
  const tap = useRef<HowlType | null>(null);
  const zaghrouta = useRef<HowlType | null>(null);
  const dodge = useRef<HowlType | null>(null);
  const synth = useRef<AmbientSynth | null>(null);
  const musicMissing = useRef(false);
  const started = useRef(false);
  const level = useRef<number>(MUSIC_LEVEL.base);
  const mutedRef = useRef(false);
  const howler = useRef<typeof import("howler").Howler | null>(null);

  const startSynth = useCallback(() => {
    if (synth.current) return;
    synth.current = createAmbientSynth();
    synth.current.setMuted(mutedRef.current);
    synth.current.setLevel(level.current, 2500);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Web Audio (not HTML5 audio) because iPhones ignore volume changes on the
    // latter, and the finale depends on fading the music.
    void import("howler").then(({ Howl, Howler }) => {
      if (cancelled) return;
      howler.current = Howler;
      music.current = new Howl({
        src: [proposal.media.music],
        loop: true,
        volume: 0,
        onloaderror: () => {
          musicMissing.current = true;
          if (started.current) startSynth();
        },
      });
      ringMusic.current = new Howl({ src: [proposal.media.ringOpen], preload: false });
      zaghrouta.current = new Howl({ src: [proposal.media.zaghrouta], preload: false });
      dodge.current = new Howl({ src: [proposal.media.dodge], preload: false, volume: 0.8 });
      shutter.current = new Howl({ src: [proposal.media.shutter] });
      tap.current = new Howl({ src: [proposal.media.tap], volume: 0.6 });
      typing.current = new Howl({ src: [proposal.media.typing], loop: true, volume: 0.9, preload: false });
    });

    return () => {
      cancelled = true;
      music.current?.unload();
      ringMusic.current?.unload();
      typing.current?.unload();
      shutter.current?.unload();
      tap.current?.unload();
      zaghrouta.current?.unload();
      dodge.current?.unload();
      synth.current?.stop();
      synth.current = null;
      started.current = false;
    };
  }, [startSynth]);

  // Silence everything while the tab is in the background.
  useEffect(() => {
    const onVisibility = () => {
      const silent = document.hidden || mutedRef.current;
      howler.current?.mute(silent);
      synth.current?.setMuted(silent);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const start = useCallback(() => {
    if (started.current) return;
    started.current = true;
    ringMusic.current?.load();
    typing.current?.load();
    zaghrouta.current?.load();
    dodge.current?.load();
    if (musicMissing.current || !music.current) {
      startSynth();
      return;
    }
    music.current.play();
    music.current.fade(0, level.current, 2500);
  }, [startSynth]);

  const setMusicLevel = useCallback((next: number, fadeMs = 2000) => {
    level.current = next;
    synth.current?.setLevel(next, fadeMs);
    const howl = music.current;
    if (howl?.playing()) howl.fade(howl.volume(), next, fadeMs);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    howler.current?.mute(next);
    synth.current?.setMuted(next);
  }, []);

  const playRingMusic = useCallback(() => {
    const howl = ringMusic.current;
    if (!howl) return;
    howl.volume(1);
    howl.play();
  }, []);

  const fadeRingMusic = useCallback(() => {
    const howl = ringMusic.current;
    if (howl?.playing()) howl.fade(howl.volume(), 0, 1200);
  }, []);

  const startTyping = useCallback(() => {
    const howl = typing.current;
    if (started.current && howl && !howl.playing()) howl.play();
  }, []);

  const stopTyping = useCallback(() => {
    typing.current?.stop();
  }, []);

  const playShutter = useCallback(() => {
    if (started.current) shutter.current?.play();
  }, []);

  const playTap = useCallback(() => {
    tap.current?.play();
  }, []);

  const playZaghrouta = useCallback(() => {
    zaghrouta.current?.stop();
    zaghrouta.current?.play();
  }, []);

  const playDodge = useCallback(() => {
    if (started.current) dodge.current?.play();
  }, []);

  const api = useMemo<AudioApi>(
    () => ({ muted, start, toggleMute, setMusicLevel, playRingMusic, fadeRingMusic, startTyping, stopTyping, playShutter, playTap, playZaghrouta, playDodge }),
    [muted, start, toggleMute, setMusicLevel, playRingMusic, fadeRingMusic, startTyping, stopTyping, playShutter, playTap, playZaghrouta, playDodge],
  );

  return <AudioContextValue.Provider value={api}>{children}</AudioContextValue.Provider>;
}
