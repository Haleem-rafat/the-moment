"use client";

import { useState } from "react";
import { TextReveal } from "@/components/animations/TextReveal";
import { CinematicButton } from "@/components/ui/CinematicButton";
import { Dialog } from "@/components/ui/Dialog";
import { SkipButton } from "@/components/ui/SkipButton";
import { useSceneTimeline } from "@/hooks/useSceneTimeline";
import { useMessages } from "@/hooks/useLocale";
import { revealText } from "@/lib/animations";
import type { SceneProps } from "@/lib/constants";

export function MysteryScene({ onNext, revisit }: SceneProps) {
  const [secretOpen, setSecretOpen] = useState(false);
  const { mystery, secretMessage, ui } = useMessages();

  const { root, done, skip } = useSceneTimeline(
    (tl) => {
      tl.to("[data-spotlight]", { opacity: 1, duration: 2 }, 0);
      revealText(tl, '[data-reveal="line-0"]', 0.6, { stagger: 0.03 });
      revealText(tl, '[data-reveal="line-1"]', ">+0.8", { stagger: 0.045 });
    },
    { instant: revisit },
  );

  return (
    <div ref={root} className="scene text-center">
      <div data-spotlight aria-hidden className="spotlight pointer-events-none absolute inset-0 opacity-0" />

      <div className="relative flex max-w-3xl flex-col items-center gap-8">
        <TextReveal
          id="line-0"
          as="h2"
          text={mystery.lines[0]}
          className="font-display text-[2.1rem] leading-snug font-light md:text-6xl"
        />
        <TextReveal
          id="line-1"
          text={mystery.lines[1]}
          className="font-display text-2xl text-[#e3bda2] ltr:italic md:text-4xl"
        />
        <div className="mt-4">
          <CinematicButton show={done} onClick={onNext}>
            {mystery.button}
          </CinematicButton>
        </div>
      </div>

      {/* The Secret Message: a faint glint she may or may not notice. */}
      <button
        type="button"
        onClick={() => setSecretOpen(true)}
        aria-label={ui.secretLabel}
        className="absolute right-[11%] bottom-[14%] flex size-11 cursor-pointer items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="glint size-3.5" fill="#e9dccb" aria-hidden>
          <path d="M12 0c.8 7.4 3.8 10.6 12 12-8.2 1.4-11.2 4.6-12 12-.8-7.4-3.8-10.6-12-12C8.2 10.600 11.200 7.400 12 0Z" />
        </svg>
      </button>

      <Dialog open={secretOpen} onClose={() => setSecretOpen(false)} label={ui.secretDialog}>
        <p dir="auto" className="max-w-md px-3 text-center font-script text-4xl leading-snug text-champagne md:text-5xl">
          {secretMessage}
        </p>
      </Dialog>

      <SkipButton show={!done} onSkip={skip} />
    </div>
  );
}
