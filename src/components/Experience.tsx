"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { ParticleBackground } from "./animations/ParticleBackground";
import { SceneTransition } from "./animations/SceneTransition";
import { InvitationScene } from "./scenes/InvitationScene";
import { ProgressIndicator } from "./ui/ProgressIndicator";
import { RestartButton } from "./ui/RestartButton";
import { SoundToggle } from "./ui/SoundToggle";
import { useAudio } from "@/hooks/useAudio";
import { useLocale, useMessages } from "@/hooks/useLocale";
import { useSceneNavigation } from "@/hooks/useSceneNavigation";
import { PARTICLE_DENSITY } from "@/lib/constants";
import { preloadExperience } from "@/lib/preload";

const MysteryScene = dynamic(() => import("./scenes/MysteryScene").then((m) => m.MysteryScene));
const MemoriesScene = dynamic(() => import("./scenes/MemoriesScene").then((m) => m.MemoriesScene));
const WhyYouScene = dynamic(() => import("./scenes/WhyYouScene").then((m) => m.WhyYouScene));
const PromiseScene = dynamic(() => import("./scenes/PromiseScene").then((m) => m.PromiseScene));
const ProposalScene = dynamic(() => import("./scenes/ProposalScene").then((m) => m.ProposalScene));

export function Experience() {
  const { hydrated, index, furthest, scene, next, goTo } = useSceneNavigation();
  const { start } = useAudio();
  const { locale, toggleLocale } = useLocale();
  const { ui } = useMessages();

  useEffect(() => preloadExperience(), []);

  // After a reload past the first scene, the next touch brings the music back.
  useEffect(() => {
    if (!hydrated || index === 0) return;
    window.addEventListener("pointerdown", start, { once: true });
    return () => window.removeEventListener("pointerdown", start);
  }, [hydrated, index, start]);

  if (!hydrated) {
    return (
      <div className="wine-stage fixed inset-0 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="glint size-5" fill="#e9dccb" aria-hidden>
          <path d="M12 0c.8 7.400 3.800 10.600 12 12-8.200 1.400-11.200 4.600-12 12-.8-7.400-3.800-10.600-12-12C8.200 10.600 11.200 7.400 12 0Z" />
        </svg>
      </div>
    );
  }

  const sceneProps = { onNext: next, revisit: index < furthest };
  const inFinale = scene === "proposal";

  return (
    <MotionConfig reducedMotion="user">
      <main className="wine-stage fixed inset-0 overflow-hidden">
        <ParticleBackground density={PARTICLE_DENSITY[scene]} />

        <div className="absolute inset-0 z-10">
          <AnimatePresence mode="wait">
            <SceneTransition key={`${scene}-${locale}`}>
              {scene === "invitation" && (
                <InvitationScene {...sceneProps} />
              )}
              {scene === "mystery" && <MysteryScene {...sceneProps} />}
              {scene === "memories" && <MemoriesScene {...sceneProps} />}
              {scene === "why-you" && <WhyYouScene {...sceneProps} />}
              {scene === "promise" && <PromiseScene {...sceneProps} />}
              {scene === "proposal" && <ProposalScene />}
            </SceneTransition>
          </AnimatePresence>
        </div>

        <div aria-hidden className="vignette pointer-events-none fixed inset-0 z-30" />
        <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
          <div className="film-grain absolute" />
        </div>

        <header
          className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-2"
          style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.25rem)" }}
        >
          {/* Hidden during the finale, when nothing should compete with the question. */}
          <div>
            {index > 0 && !inFinale && (
              <ProgressIndicator index={index} furthest={furthest} onSelect={goTo} />
            )}
          </div>
          <div className="flex items-center">
            {/* Language is chosen on the first screen, so a story in progress never restarts. */}
            {index === 0 && (
              <button
                type="button"
                onClick={toggleLocale}
                className="min-h-11 cursor-pointer px-3 text-xs text-champagne/70 transition-colors hover:text-champagne"
              >
                {ui.switchLanguage}
              </button>
            )}
            {index > 0 && <RestartButton />}
            <SoundToggle />
          </div>
        </header>
      </main>
    </MotionConfig>
  );
}
