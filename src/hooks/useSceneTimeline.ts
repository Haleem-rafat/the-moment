"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "framer-motion";

gsap.registerPlugin(useGSAP);

/**
 * Runs a scene's GSAP timeline once, scoped to `root`. It jumps straight to the
 * end when `instant` is set or the device asks for reduced motion.
 */
export function useSceneTimeline(
  build: (tl: gsap.core.Timeline) => void,
  { instant = false }: { instant?: boolean } = {},
) {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const tl = gsap.timeline({ onComplete: () => setDone(true) });
      build(tl);
      timeline.current = tl;
      if (instant || reduced) tl.progress(1);
    },
    { scope: root },
  );

  const skip = useCallback(() => timeline.current?.progress(1), []);

  return { root, done, skip };
}
