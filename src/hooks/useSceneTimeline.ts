"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";
import type { TextSound } from "@/lib/animations";

gsap.registerPlugin(useGSAP);

/**
 * Runs a scene's GSAP timeline once, scoped to `root`. It jumps straight to the
 * end when `instant` is set or the device asks for reduced motion.
 */
export function useSceneTimeline(
  build: (tl: gsap.core.Timeline, sound: TextSound) => void,
  { instant = false }: { instant?: boolean } = {},
) {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();
  const { startTyping, stopTyping } = useAudio();

  useGSAP(
    () => {
      const tl = gsap.timeline({
        onComplete: () => {
          stopTyping();
          setDone(true);
        },
      });
      // No keyboard sound when the text appears all at once.
      build(tl, instant || reduced ? { start: () => {}, stop: () => {} } : { start: startTyping, stop: stopTyping });
      timeline.current = tl;
      if (instant || reduced) tl.progress(1);
      return () => stopTyping();
    },
    { scope: root },
  );

  const skip = useCallback(() => timeline.current?.progress(1), []);

  return { root, done, skip };
}
