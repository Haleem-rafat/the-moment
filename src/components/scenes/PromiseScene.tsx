"use client";

import { TextReveal } from "@/components/animations/TextReveal";
import { CinematicButton } from "@/components/ui/CinematicButton";
import { SkipButton } from "@/components/ui/SkipButton";
import { useSceneTimeline } from "@/hooks/useSceneTimeline";
import { useMessages } from "@/hooks/useLocale";
import { revealText } from "@/lib/animations";
import type { SceneProps } from "@/lib/constants";

export function PromiseScene({ onNext, revisit }: SceneProps) {
  const { promise } = useMessages();
  const { root, done, skip } = useSceneTimeline(
    (tl) => {
      tl.to("[data-photo]", { opacity: 1, duration: 3, ease: "sine.inOut" }, 0);
      promise.lines.forEach((_, i) => {
        revealText(tl, `[data-reveal="line-${i}"]`, i === 0 ? 1.5 : ">+1.3", {
          stagger: 0.14,
          duration: 1.1,
        });
      });
      revealText(tl, '[data-reveal="closing"]', ">+1.8", { stagger: 0.05 });
    },
    { instant: revisit },
  );

  return (
    <div ref={root} className="scene text-center">
      <div data-photo aria-hidden className="absolute inset-0 overflow-hidden opacity-0">
        <div className="ken-burns absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgb(233_220_203/0.07),transparent_70%)]" />
      </div>

      <div className="relative flex max-w-3xl flex-col items-center gap-3 md:gap-4">
        {promise.lines.map((line, i) => (
          <TextReveal
            key={i}
            id={`line-${i}`}
            by="word"
            text={line}
            className="font-display text-[clamp(1.2rem,3.3dvh,1.7rem)] leading-snug font-light md:text-[2.4rem]"
          />
        ))}
        <TextReveal
          id="closing"
          text={promise.closing}
          className="mt-2 font-script text-[clamp(1.6rem,4.4dvh,2.3rem)] leading-snug text-[#d8ae90] md:text-5xl"
        />
        <div className="mt-3">
          <CinematicButton show={done} onClick={onNext}>
            {promise.button}
          </CinematicButton>
        </div>
      </div>

      <SkipButton show={!done} onSkip={skip} />
    </div>
  );
}
