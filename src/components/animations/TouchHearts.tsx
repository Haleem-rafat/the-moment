"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";
import { hapticTap } from "@/lib/haptics";

const HEARTS_PER_TOUCH = 8;
const COLORS = ["#f0b9c4", "#e98fa3", "#d8ae90", "#f7d9c4"];
const HEART =
  '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M12 21C4 15 2 11 2 7.800 2 5 4.200 3 6.800 3c2 0 3.700 1 5.200 3 1.500-2 3.200-3 5.200-3C19.800 3 22 5 22 7.800 22 11 20 15 12 21Z"/></svg>';

/**
 * Every touch: hearts falling from the finger, a soft sound and a small vibration.
 * The first touch anywhere also starts the music, since browsers block sound before it.
 */
export function TouchHearts() {
  const { start, playTap } = useAudio();
  const reduced = useReducedMotion();

  useEffect(() => {
    const spawn = (x: number, y: number) => {
      for (let i = 0; i < HEARTS_PER_TOUCH; i += 1) {
        const size = 12 + Math.random() * 14;
        const heart = document.createElement("div");
        heart.setAttribute("aria-hidden", "true");
        heart.className = "touch-heart";
        heart.innerHTML = HEART;
        heart.style.cssText = `position:fixed;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;z-index:70;pointer-events:none;color:${COLORS[i % COLORS.length]}`;
        document.body.append(heart);
        const driftX = (Math.random() - 0.5) * 150;
        const fall = 130 + Math.random() * 190;
        const spin = (Math.random() - 0.5) * 120;
        const animation = heart.animate(
          [
            { transform: "translate(0, 0) scale(.3) rotate(0deg)", opacity: 1 },
            { transform: `translate(${driftX * 0.4}px, -22px) scale(1) rotate(${spin / 3}deg)`, opacity: 1, offset: 0.18 },
            { transform: `translate(${driftX}px, ${fall}px) scale(.8) rotate(${spin}deg)`, opacity: 0 },
          ],
          { duration: 900 + Math.random() * 500, delay: Math.random() * 90, easing: "cubic-bezier(.3,.1,.5,1)", fill: "both" },
        );
        animation.onfinish = () => heart.remove();
      }
    };

    const onPress = (event: PointerEvent) => {
      start();
      playTap();
      if (!reduced) spawn(event.clientX, event.clientY);
    };
    const onClick = () => hapticTap();

    window.addEventListener("pointerdown", onPress, true);
    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("pointerdown", onPress, true);
      window.removeEventListener("click", onClick, true);
      document.querySelectorAll(".touch-heart").forEach((heart) => heart.remove());
    };
  }, [playTap, reduced, start]);

  return null;
}
