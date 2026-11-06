"use client";

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RingFallback } from "@/components/3d/RingFallback";
import type { RingPhase } from "@/components/3d/RingBox";
import { RosePetals } from "@/components/animations/RosePetals";
import { CinematicButton } from "@/components/ui/CinematicButton";
import { RunawayButton } from "@/components/ui/RunawayButton";
import { proposal } from "@/data/proposal";
import { SkipButton } from "@/components/ui/SkipButton";
import { useAudio } from "@/hooks/useAudio";
import { useMessages } from "@/hooks/useLocale";
import { CINEMATIC_EASE } from "@/lib/animations";
import { MUSIC_LEVEL } from "@/lib/constants";

const RingBox = dynamic(() => import("@/components/3d/RingBox"), { ssr: false });

type Answer = "asking" | "moment" | "yes";

const RING_LOAD_TIMEOUT_MS = 20000;

/** Falls back to the drawn ring if 3D crashes, because this scene must never break. */
class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.5, delay, ease: CINEMATIC_EASE },
});

export function ProposalScene() {
  const { setMusicLevel, playRingMusic, fadeRingMusic } = useAudio();
  const { finale } = useMessages();
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<RingPhase>("dark");
  const [spotlight, setSpotlight] = useState(false);
  const [petals, setPetals] = useState(0);
  const [burst, setBurst] = useState(0);
  const [answer, setAnswer] = useState<Answer>("asking");
  const [canReturn, setCanReturn] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [ringReady, setRingReady] = useState(false);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!supportsWebGL()) {
      setWebgl(false);
      setRingReady(true);
      return;
    }
    let active = true;
    // On a very slow connection, stop waiting and use the drawn ring.
    const giveUp = setTimeout(() => {
      if (!active) return;
      setWebgl(false);
      setRingReady(true);
    }, RING_LOAD_TIMEOUT_MS);
    void import("@/components/3d/RingBox")
      .then(() => {
        if (active) setRingReady(true);
      })
      .catch(() => {
        if (!active) return;
        setWebgl(false);
        setRingReady(true);
      })
      .finally(() => clearTimeout(giveUp));
    return () => {
      active = false;
      clearTimeout(giveUp);
    };
  }, []);

  const showQuestion = useCallback(() => {
    setSpotlight(true);
    setPetals(14);
    setStage("question");
    fadeRingMusic();
    setMusicLevel(MUSIC_LEVEL.swell, 3000);
  }, [fadeRingMusic, setMusicLevel]);

  useEffect(() => {
    setMusicLevel(MUSIC_LEVEL.hush, 2200);
    if (!ringReady) return;

    if (reduced) {
      const tl = gsap.timeline();
      tl.call(playRingMusic, undefined, 0.2).call(showQuestion, undefined, 9);
      timeline.current = tl;
      return () => {
        tl.kill();
      };
    }

    const tl = gsap.timeline();
    tl.call(() => setSpotlight(true), undefined, 0.3)
      .call(() => setStage("box"), undefined, 1)
      .call(() => setStage("zoom"), undefined, 2.8)
      .call(
        () => {
          setStage("open");
          // The song stays low so the ring's own music has the moment to itself.
          playRingMusic();
        },
        undefined,
        5.8,
      )
      .call(() => setStage("ring"), undefined, 7.4)
      .call(() => setPetals(22), undefined, 8.8)
      .call(showQuestion, undefined, 13);
    timeline.current = tl;

    return () => {
      tl.kill();
    };
  }, [playRingMusic, reduced, ringReady, setMusicLevel, showQuestion]);

  const skip = () => {
    timeline.current?.kill();
    showQuestion();
  };

  const sayYes = () => {
    setAnswer("yes");
    setBurst((b) => b + 1);
    setPetals(40);
    setMusicLevel(MUSIC_LEVEL.swell, 1500);
  };

  // A real, unhurried choice: the music softens and nothing asks her to hurry back.
  const takeAMoment = () => {
    setAnswer("moment");
    setCanReturn(false);
    setMusicLevel(MUSIC_LEVEL.gentle, 2500);
    gsap.delayedCall(7, () => setCanReturn(true));
  };

  const returnToQuestion = () => {
    setAnswer("asking");
    setMusicLevel(MUSIC_LEVEL.swell, 2500);
  };

  const asked = stage === "question";
  const lidOpen = stage === "open" || stage === "ring" || stage === "question";
  const fallback = <RingFallback open={lidOpen} />;

  return (
    <div className="absolute inset-0 overflow-clip bg-midnight/75">
      <motion.div
        aria-hidden
        className="spotlight absolute inset-0 scale-125"
        initial={{ opacity: 0 }}
        animate={{ opacity: spotlight ? 1 : 0 }}
        transition={{ duration: 3, ease: "easeInOut" }}
      />

      {webgl ? (
        <SceneBoundary fallback={fallback}>
          <RingBox phase={stage} instant={Boolean(reduced)} />
        </SceneBoundary>
      ) : (
        fallback
      )}

      <RosePetals amount={petals} burst={burst} />

      {asked && (
        <div
          className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center px-6 text-center"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)" }}
        >
          <AnimatePresence mode="wait">
            {answer === "asking" && (
              <motion.div
                key="asking"
                exit={{ opacity: 0, transition: { duration: 0.7 } }}
                className="flex flex-col items-center"
              >
                <motion.p {...rise(1)} className="font-script text-xl text-balance text-[#d8ae90] ltr:font-body ltr:text-[0.62rem] ltr:font-medium ltr:tracking-[0.3em] md:text-2xl ltr:md:text-xs">
                  {finale.eyebrow}
                </motion.p>
                <motion.h1
                  {...rise(2.2)}
                  dir="auto"
                  className="mt-3 font-display text-[2.9rem] leading-snug font-light text-balance md:text-7xl"
                >
                  {finale.question}
                </motion.h1>
                <motion.p
                  {...rise(3.6)}
                  dir="auto"
                  className="mt-3 font-script text-[1.65rem] leading-snug text-balance text-champagne/85 md:text-[2.2rem]"
                >
                  {finale.subline}
                </motion.p>
                <motion.div
                  {...rise(5)}
                  className="mt-4 flex w-full flex-col items-center gap-2.5 md:flex-row md:justify-center md:gap-5"
                >
                  <CinematicButton onClick={sayYes}>{finale.yes}</CinematicButton>
                  <CinematicButton variant="quiet" onClick={takeAMoment}>
                    {finale.moment}
                  </CinematicButton>
                  <RunawayButton labels={finale.no} />
                </motion.div>
              </motion.div>
            )}

            {answer === "moment" && (
              <motion.div
                key="moment"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="flex min-h-[38dvh] flex-col items-center justify-center gap-6"
              >
                <p dir="auto" className="max-w-xl font-display text-[2.1rem] leading-snug font-light md:text-5xl">
                  {finale.momentMessage}
                </p>
                <CinematicButton variant="quiet" show={canReturn} onClick={returnToQuestion}>
                  {finale.momentReturn}
                </CinematicButton>
              </motion.div>
            )}

            {answer === "yes" && (
              <motion.div
                key="yes"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.6, ease: CINEMATIC_EASE }}
                className="flex min-h-[38dvh] flex-col items-center justify-center"
              >
                <h1 dir="auto" className="font-script text-[2.8rem] leading-snug text-balance text-[#f0d4b4] md:text-8xl">
                  {finale.yesHeading}
                </h1>
                <motion.p {...rise(1.2)} dir="auto" className="mt-3 max-w-lg font-display text-2xl font-light md:text-3xl">
                  {finale.yesMessage}
                </motion.p>
                <motion.p {...rise(2.4)} className="mt-5 font-script text-xl text-rose-gold">
                  {finale.signature}
                </motion.p>
                {proposal.whatsappNumber && (
                  <motion.a
                    {...rise(3.2)}
                    href={`https://wa.me/${proposal.whatsappNumber}?text=${encodeURIComponent(finale.whatsappText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex min-h-12 items-center rounded-full border border-rose-gold bg-rose-gold/10 px-8 text-sm font-medium text-champagne ltr:text-xs ltr:tracking-[0.28em]"
                  >
                    {finale.whatsapp}
                  </motion.a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <SkipButton show={!asked} onSkip={skip} />
    </div>
  );
}
