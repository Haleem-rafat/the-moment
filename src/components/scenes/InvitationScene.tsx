"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TextReveal } from "@/components/animations/TextReveal";
import { CinematicButton } from "@/components/ui/CinematicButton";
import { SkipButton } from "@/components/ui/SkipButton";
import { useAudio } from "@/hooks/useAudio";
import { useSceneTimeline } from "@/hooks/useSceneTimeline";
import { useMessages } from "@/hooks/useLocale";
import { revealText } from "@/lib/animations";
import type { SceneProps } from "@/lib/constants";

export function InvitationScene({ onNext, revisit }: SceneProps) {
  const { start } = useAudio();
  const { invitation } = useMessages();
  const [sceneReady, setSceneReady] = useState(false);

  const { root, done, skip } = useSceneTimeline(
    (tl, sound) => {
      tl.to("[data-spotlight]", { opacity: 1, duration: 1.4, ease: "sine.inOut" }, 0);
      tl.fromTo("[data-zoom]", { scale: 1.18 }, { scale: 1, duration: 12, ease: "sine.out" }, 0);
      invitation.lines.forEach((_, i) => {
        revealText(tl, `[data-reveal="line-${i}"]`, i === 0 ? 0.15 : ">+0.3", {
          stagger: i === 2 ? 0.03 : 0.035,
          sound,
        });
      });
      tl.call(() => setSceneReady(true), undefined, ">+0.2");
    },
    { instant: revisit },
  );

  const handleEnter = () => {
    start(); // Browsers only allow sound after her first tap.
    onNext();
  };

  const showButton = sceneReady || done;

  return (
    <div ref={root} className="scene text-center">
      <div data-zoom aria-hidden className="pointer-events-none absolute inset-0">
        <div data-spotlight className="spotlight absolute inset-0 opacity-0" />
      </div>

      <div className="relative flex max-w-3xl flex-col items-center gap-5 md:gap-7">
        <TextReveal
          id="line-0"
          as="h1"
          text={invitation.lines[0]}
          className="font-display text-[2.35rem] leading-snug font-light md:text-7xl"
        />
        <TextReveal
          id="line-1"
          text={invitation.lines[1]}
          className="font-display text-2xl leading-snug font-light text-champagne/85 ltr:italic md:text-4xl"
        />
        <TextReveal
          id="line-2"
          text={invitation.lines[2]}
          className="text-sm leading-relaxed text-[#e3bda2] md:text-base"
        />
        <div className="mt-6 flex flex-col items-center gap-4">
          <CinematicButton show={showButton} onClick={handleEnter}>
            {invitation.button}
          </CinematicButton>
          <motion.p
            initial={false}
            animate={{ opacity: showButton ? 0.55 : 0 }}
            transition={{ duration: 1.4, delay: 0.5 }}
            className="text-xs text-champagne"
          >
            {invitation.soundHint}
          </motion.p>
        </div>
      </div>

      <SkipButton show={!done && !sceneReady} onSkip={skip} />
    </div>
  );
}
