"use client";

import { forwardRef } from "react";
import type { FrameScene, FutureFrame } from "@/data/memories";
import { useMessages } from "@/hooks/useLocale";
import { FrameIllustration } from "./FrameIllustration";

/** A photo slot drawn like a selected frame in a design tool, a wink for a designer. */
export function EmptyFrame({ number, scene }: { number: number; scene: FrameScene }) {
  const handles = ["-top-1 -right-1", "-top-1 -left-1", "-right-1 -bottom-1", "-bottom-1 -left-1"];
  return (
    <span className="relative block aspect-[5/4] border border-rose-gold bg-burgundy">
      <span dir="ltr" className="absolute -top-5 left-0 font-mono text-[0.6rem] text-rose-gold">
        Frame {String(number).padStart(2, "0")}
      </span>
      {handles.map((position) => (
        <span
          key={position}
          aria-hidden
          className={`absolute size-2 border border-rose-gold bg-[#f4ece0] ${position}`}
        />
      ))}
      <FrameIllustration scene={scene} />
      <span data-flash aria-hidden className="absolute inset-0 bg-white opacity-0" />
    </span>
  );
}

interface MemoryCardProps {
  memory: FutureFrame;
  number: number;
  rotation: number;
  onOpen: () => void;
}

/** A Polaroid holding an illustration and a line. Its outer element is what the scene animates. */
export const MemoryCard = forwardRef<HTMLButtonElement, MemoryCardProps>(function MemoryCard(
  { memory, number, rotation, onOpen },
  ref,
) {
  const { ui } = useMessages();
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      aria-label={`${ui.openFrame}: ${memory.title}`}
      data-memory
      style={{ opacity: 0 }}
      className="w-[min(72vw,36dvh)] shrink-0 cursor-pointer snap-center md:w-[min(340px,40dvh)]"
    >
      <span
        className="relative block bg-[#f4ece0] p-3 pt-7 pb-4 text-midnight shadow-[0_24px_60px_rgb(0_0_0/0.5)] transition-transform duration-500 hover:scale-[1.02]"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <EmptyFrame number={number} scene={memory.scene} />
        <span className="mt-2 block font-script text-xl leading-snug">{memory.title}</span>
      </span>
    </button>
  );
});
