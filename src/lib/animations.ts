import type { Transition } from "framer-motion";

export const CINEMATIC_EASE = [0.22, 1, 0.36, 1] as const;

export const fadeIn: Transition = { duration: 1.2, ease: CINEMATIC_EASE };

/** Adds a character or word reveal (see TextReveal) to a GSAP timeline. */
export function revealText(
  tl: gsap.core.Timeline,
  selector: string,
  position?: gsap.Position,
  { stagger = 0.028, duration = 0.9 }: { stagger?: number; duration?: number } = {},
) {
  tl.to(
    `${selector} [data-unit]`,
    { opacity: 1, y: 0, duration, stagger, ease: "power2.out" },
    position,
  );
}
