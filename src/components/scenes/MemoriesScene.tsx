"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { motion, useReducedMotion } from "framer-motion";
import { CinematicButton } from "@/components/ui/CinematicButton";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyFrame, MemoryCard } from "@/components/ui/MemoryCard";
import { SkipButton } from "@/components/ui/SkipButton";
import { useAudio } from "@/hooks/useAudio";
import { useSceneTimeline } from "@/hooks/useSceneTimeline";
import { useMessages } from "@/hooks/useLocale";
import type { SceneProps } from "@/lib/constants";

const ROTATIONS = [-2.5, 1.8, -1.2, 2.6, -2, 1.4, -1.8];
const PARALLAX_PX = [14, 24, 10, 20];
/** How long a frame stays, so its line can be read. */
const holdFor = (text: string) => Math.min(5200, 2200 + text.length * 26);
const SLIDE_MS = 750;

export function MemoriesScene({ onNext, revisit }: SceneProps) {
  const { frames: memories, memoriesCopy } = useMessages();
  const { playShutter } = useAudio();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [reachedEnd, setReachedEnd] = useState(revisit);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  const paused = useRef(false);
  const skipped = useRef(false);

  const { root } = useSceneTimeline(
    (tl) => {
      tl.fromTo(
        "[data-memory]",
        { opacity: 0, y: 46, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
        0,
      );
    },
    { instant: revisit },
  );

  // Mouse parallax: each card drifts by its own depth.
  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const movers = cards.current.flatMap((card, i) => {
      if (!card) return [];
      const depth = PARALLAX_PX[i % PARALLAX_PX.length];
      return [
        {
          depth,
          x: gsap.quickTo(card, "x", { duration: 1.1, ease: "power3.out" }),
          y: gsap.quickTo(card, "y", { duration: 1.1, ease: "power3.out" }),
        },
      ];
    });
    const onMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      for (const m of movers) {
        m.x(-nx * m.depth);
        m.y(-ny * m.depth);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  // The frames play by themselves: each slides to the center, then the camera clicks.
  useEffect(() => {
    let cancelled = false;
    const waitFor = async (ms: number) => {
      let left = ms;
      while (left > 0 && !cancelled && !skipped.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (!paused.current) left -= 100;
      }
    };
    const show = (i: number) =>
      cards.current[i]?.scrollIntoView({ inline: "center", block: "nearest", behavior: reduced ? "auto" : "smooth" });

    void (async () => {
      await waitFor(1200);
      for (let i = 0; i < memories.length; i += 1) {
        if (cancelled || skipped.current) break;
        if (i > 0) {
          show(i);
          await waitFor(SLIDE_MS);
        }
        if (cancelled || skipped.current) break;
        playShutter();
        const flash = cards.current[i]?.querySelector("[data-flash]");
        if (flash && !reduced) gsap.fromTo(flash, { opacity: 0.9 }, { opacity: 0, duration: 0.65, ease: "power2.out" });
        await waitFor(holdFor(memories[i].description));
      }
      if (!cancelled) setReachedEnd(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [memories, playShutter, reduced]);

  // Opening a frame holds the show until it is closed.
  useEffect(() => {
    paused.current = openIndex !== null;
  }, [openIndex]);

  const skipShow = () => {
    skipped.current = true;
    cards.current[memories.length - 1]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "auto" });
    setReachedEnd(true);
  };

  const opened = openIndex === null ? null : memories[openIndex];

  return (
    <div ref={root} className="scene !px-0">
      <h2 className="mb-3 shrink-0 px-6 text-center font-display text-3xl font-light md:mb-5 md:text-5xl">
        {memoriesCopy.heading}
      </h2>

      <div className="relative w-full shrink-0">
        <div
          className="no-scrollbar flex w-full items-center gap-10 overflow-x-hidden py-7"
          style={{ paddingInline: "max(16vw, calc(50vw - 160px))" }}
        >
          {memories.map((memory, i) => (
            <MemoryCard
              key={memory.scene}
              ref={(el) => {
                cards.current[i] = el;
              }}
              memory={memory}
              number={i + 1}
              rotation={ROTATIONS[i % ROTATIONS.length]}
              onOpen={() => setOpenIndex(i)}
            />
          ))}
        </div>

      </div>

      <div className="mt-1 flex min-h-32 shrink-0 flex-col items-center gap-3">
        <motion.p
          initial={false}
          animate={{ opacity: reachedEnd ? 1 : 0 }}
          transition={{ duration: 1 }}
          className="px-6 text-center font-script text-2xl leading-snug text-balance text-[#d8ae90]"
        >
          {memoriesCopy.closing}
        </motion.p>
        <CinematicButton show={reachedEnd} onClick={onNext}>
          {memoriesCopy.button}
        </CinematicButton>
      </div>

      <SkipButton show={!reachedEnd} onSkip={skipShow} />

      <Dialog
        open={opened !== null}
        onClose={() => setOpenIndex(null)}
        label={opened?.title ?? ""}
      >
        {opened && (
          <figure className="w-[min(82vw,50dvh)] bg-[#f4ece0] p-3 text-midnight md:p-4">
            <div className="pt-5">
              <EmptyFrame number={(openIndex ?? 0) + 1} scene={opened.scene} />
            </div>
            <figcaption className="px-1 pt-3">
              <span className="block font-script text-3xl leading-snug">{opened.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-midnight/75">
                {opened.description}
              </span>
            </figcaption>
          </figure>
        )}
      </Dialog>
    </div>
  );
}
