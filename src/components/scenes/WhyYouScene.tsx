"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Eye, Feather, Home, Moon, Sparkles, type LucideIcon } from "lucide-react";
import { CinematicButton } from "@/components/ui/CinematicButton";
import type { Reason } from "@/data/messages";
import { useMessages } from "@/hooks/useLocale";
import { CINEMATIC_EASE } from "@/lib/animations";
import type { SceneProps } from "@/lib/constants";

const ICONS: Record<Reason["icon"], LucideIcon> = {
  faith: Moon,
  eyes: Eye,
  grace: Feather,
  craft: Sparkles,
  family: Home,
};

const BURST = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const distance = 70 + (i % 3) * 32;
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, delay: (i % 4) * 0.03 };
});

function ReasonCard({
  reason,
  flipped,
  onFlip,
}: {
  reason: Reason;
  flipped: boolean;
  onFlip: () => void;
}) {
  const reduced = useReducedMotion();
  const { ui } = useMessages();
  const Icon = ICONS[reason.icon];
  const face =
    "absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl p-4 text-center [backface-visibility:hidden]";

  return (
    <button
      type="button"
      onClick={onFlip}
      disabled={flipped}
      aria-label={flipped ? `${reason.title}: ${reason.message}` : `${ui.revealReason} ${reason.title}`}
      className="relative h-[clamp(6rem,17dvh,10rem)] w-full cursor-pointer [perspective:1200px] disabled:cursor-default md:h-52"
    >
      <motion.span
        className="absolute inset-0 block [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: reduced ? 0 : 1.1, ease: CINEMATIC_EASE }}
      >
        <span className={`${face} border border-rose-gold/40 bg-burgundy/60`}>
          <Icon size={22} strokeWidth={1.2} className="text-rose-gold" />
          <span className="font-display text-xl font-light md:text-2xl">{reason.title}</span>
        </span>
        <span
          className={`${face} border border-rose-gold bg-burgundy shadow-[0_0_34px_rgb(167_123_99/0.5)] [transform:rotateY(180deg)]`}
        >
          <span dir="auto" className="font-script text-xl leading-snug text-balance md:text-4xl">
            {reason.message}
          </span>
        </span>
      </motion.span>

      {flipped && !reduced && (
        <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2">
          {BURST.map((p, i) => (
            <motion.span
              key={i}
              className="absolute size-1.5 rounded-full bg-[#f0cfa8] shadow-[0_0_8px_#f0cfa8]"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
              transition={{ duration: 1.3, delay: 0.25 + p.delay, ease: "easeOut" }}
            />
          ))}
        </span>
      )}
    </button>
  );
}

export function WhyYouScene({ onNext, revisit }: SceneProps) {
  const { whyYou } = useMessages();
  const [opened, setOpened] = useState<Set<number>>(
    () => new Set(revisit ? whyYou.reasons.map((_, i) => i) : []),
  );
  const allOpen = opened.size === whyYou.reasons.length;

  return (
    <div className="scene text-center">
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="shrink-0 font-display text-4xl font-light ltr:italic md:text-6xl"
      >
        {whyYou.heading}
      </motion.h2>
      <motion.p
        animate={{ opacity: allOpen ? 0 : 0.6 }}
        className="mt-2 mb-5 shrink-0 text-xs md:mb-9"
      >
        {whyYou.hint}
      </motion.p>

      <div className="grid w-full max-w-md shrink-0 grid-cols-2 gap-3 md:max-w-4xl md:grid-cols-6 md:gap-5">
        {whyYou.reasons.map((reason, i) => (
          <motion.div
            key={reason.title}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 + i * 0.15, ease: CINEMATIC_EASE }}
            className={`md:col-span-2 ${
              i === whyYou.reasons.length - 1 ? "col-span-2 md:col-span-3" : ""
            } ${i === whyYou.reasons.length - 2 ? "md:col-span-3" : ""}`}
          >
            <ReasonCard
              reason={reason}
              flipped={opened.has(i)}
              onFlip={() => setOpened((prev) => new Set(prev).add(i))}
            />
          </motion.div>
        ))}
      </div>

      <div className="mt-6 shrink-0 md:mt-10">
        <CinematicButton show={allOpen} onClick={onNext}>
          {whyYou.button}
        </CinematicButton>
      </div>
    </div>
  );
}
