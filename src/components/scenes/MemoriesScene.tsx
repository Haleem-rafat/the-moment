"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CinematicButton } from "@/components/ui/CinematicButton";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyFrame, MemoryCard } from "@/components/ui/MemoryCard";
import { useSceneTimeline } from "@/hooks/useSceneTimeline";
import { useMessages } from "@/hooks/useLocale";
import type { SceneProps } from "@/lib/constants";

const ROTATIONS = [-2.5, 1.8, -1.2, 2.6, -2, 1.4, -1.8];
const PARALLAX_PX = [14, 24, 10, 20];

export function MemoriesScene({ onNext, revisit }: SceneProps) {
  const { frames: memories, memoriesCopy, ui, isRtl } = useMessages();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [reachedEnd, setReachedEnd] = useState(revisit);
  const scroller = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();

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

  // Fires a camera flash on every other frame, and notices when the last one is seen.
  useEffect(() => {
    const flashed = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = cards.current.indexOf(entry.target as HTMLButtonElement);
          if (i === memories.length - 1) setReachedEnd(true);
          if (i % 2 !== 0 || flashed.has(entry.target) || reduced) continue;
          flashed.add(entry.target);
          const flash = entry.target.querySelector("[data-flash]");
          if (flash) {
            gsap.fromTo(flash, { opacity: 0.85 }, { opacity: 0, duration: 0.9, ease: "power2.out", delay: 0.25 });
          }
        }
      },
      { root: scroller.current, threshold: 0.6 },
    );
    cards.current.forEach((card) => card && observer.observe(card));
    return () => observer.disconnect();
  }, [reduced, memories]);

  const scrollByCard = (direction: 1 | -1) => {
    const first = cards.current[0];
    if (!first || !scroller.current) return;
    scroller.current.scrollBy({
      left: direction * (first.offsetWidth + 40),
      behavior: reduced ? "auto" : "smooth",
    });
  };

  const opened = openIndex === null ? null : memories[openIndex];

  return (
    <div ref={root} className="scene !px-0">
      <h2 className="mb-3 shrink-0 px-6 text-center font-display text-3xl font-light md:mb-5 md:text-5xl">
        {memoriesCopy.heading}
      </h2>

      <div className="relative w-full shrink-0">
        <div
          ref={scroller}
          onWheel={(e) => {
            if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
              e.currentTarget.scrollLeft += isRtl ? -e.deltaY : e.deltaY;
            }
          }}
          className="no-scrollbar flex w-full items-center gap-10 overflow-x-auto py-7 pointer-coarse:snap-x pointer-coarse:snap-mandatory"
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

        {[-1, 1].map((direction) => (
          <button
            key={direction}
            type="button"
            onClick={() => scrollByCard(direction as 1 | -1)}
            aria-label={direction < 0 === isRtl ? ui.forward : ui.backward}
            className={`absolute top-1/2 hidden size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-champagne/25 text-champagne/70 transition-colors hover:border-rose-gold hover:text-champagne pointer-fine:flex ${
              direction < 0 ? "left-6" : "right-6"
            }`}
          >
            {direction < 0 ? (
              <ChevronLeft size={20} strokeWidth={1.5} />
            ) : (
              <ChevronRight size={20} strokeWidth={1.5} />
            )}
          </button>
        ))}
      </div>

      <div className="mt-1 flex shrink-0 flex-col items-center gap-3">
        <motion.p
          key={reachedEnd ? "closing" : "hint"}
          initial={{ opacity: 0 }}
          animate={{ opacity: reachedEnd ? 1 : 0.6 }}
          transition={{ duration: 1 }}
          className={
            reachedEnd
              ? "px-6 text-center font-script text-2xl leading-snug text-balance text-[#d8ae90]"
              : "text-xs text-champagne"
          }
        >
          {reachedEnd ? memoriesCopy.closing : memoriesCopy.swipeHint}
        </motion.p>
        <CinematicButton show={reachedEnd} onClick={onNext}>
          {memoriesCopy.button}
        </CinematicButton>
      </div>

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
