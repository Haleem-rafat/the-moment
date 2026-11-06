import type { Transition } from "framer-motion";

export const CINEMATIC_EASE = [0.22, 1, 0.36, 1] as const;

export const fadeIn: Transition = { duration: 1.2, ease: CINEMATIC_EASE };

/** Turns the keyboard sound on and off around a text reveal. */
export type TextSound = { start: () => void; stop: () => void };

/** Adds a character or word reveal (see TextReveal) to a GSAP timeline. */
export function revealText(
  tl: gsap.core.Timeline,
  selector: string,
  position?: gsap.Position,
  {
    stagger = 0.028,
    duration = 0.9,
    sound,
  }: { stagger?: number; duration?: number; sound?: TextSound } = {},
) {
  if (sound) tl.call(sound.start, undefined, position);
  tl.to(
    `${selector} [data-unit]`,
    { opacity: 1, y: 0, duration, stagger, ease: "power2.out" },
    sound ? "<" : position,
  );
  if (sound) tl.call(sound.stop, undefined, ">-0.3");
}
