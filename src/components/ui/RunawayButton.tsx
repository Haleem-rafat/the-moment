"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const EDGE_MARGIN = 16;
const TOP_MARGIN = 64;
/** The mouse only has to come this close, in pixels, for the button to run. */
const MOUSE_TRIGGER_PX = 110;
const MIN_ESCAPE_PX = 170;
const BUTTON_GAP = 10;

/** The playful "no": it dodges every mouse and finger, and can never be pressed. */
export function RunawayButton({ labels }: { labels: string[] }) {
  const ref = useRef<HTMLButtonElement>(null);
  const homeRect = useRef<DOMRect | null>(null);
  const lastMove = useRef(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [tries, setTries] = useState(0);

  const flee = (pointerX?: number, pointerY?: number) => {
    const el = ref.current;
    const now = performance.now();
    if (!el || now - lastMove.current < 120) return;
    lastMove.current = now;

    const rect = el.getBoundingClientRect();
    homeRect.current ??= rect;
    const home = homeRect.current;
    const fromX = pointerX ?? rect.left + rect.width / 2;
    const fromY = pointerY ?? rect.top + rect.height / 2;
    const maxX = Math.max(EDGE_MARGIN, window.innerWidth - rect.width - EDGE_MARGIN);
    const maxY = Math.max(TOP_MARGIN, window.innerHeight - rect.height - EDGE_MARGIN);

    // It must never land on the real answers, or it would block them.
    const others = Array.from(document.querySelectorAll("button, a"))
      .filter((other) => other !== el)
      .map((other) => other.getBoundingClientRect());
    const isClear = (x: number, y: number) =>
      Math.hypot(x + rect.width / 2 - fromX, y + rect.height / 2 - fromY) > MIN_ESCAPE_PX &&
      others.every(
        (o) =>
          x + rect.width + BUTTON_GAP < o.left ||
          x - BUTTON_GAP > o.right ||
          y + rect.height + BUTTON_GAP < o.top ||
          y - BUTTON_GAP > o.bottom,
      );

    // If no clear spot turns up, the area over the box is always free of buttons.
    let x = (window.innerWidth - rect.width) / 2;
    let y = TOP_MARGIN;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const candidateX = EDGE_MARGIN + Math.random() * (maxX - EDGE_MARGIN);
      const candidateY = TOP_MARGIN + Math.random() * (maxY - TOP_MARGIN);
      if (isClear(candidateX, candidateY)) {
        x = candidateX;
        y = candidateY;
        break;
      }
    }
    setOffset({ x: x - home.left, y: y - home.top });
    setTries((t) => t + 1);
  };

  const fleeRef = useRef(flee);
  useEffect(() => {
    fleeRef.current = flee;
  });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return;
      const distance = Math.hypot(
        rect.left + rect.width / 2 - e.clientX,
        rect.top + rect.height / 2 - e.clientY,
      );
      if (distance < MOUSE_TRIGGER_PX) fleeRef.current(e.clientX, e.clientY);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <motion.button
      ref={ref}
      type="button"
      data-runaway
      onPointerEnter={(e) => flee(e.clientX, e.clientY)}
      onPointerDown={(e) => {
        e.preventDefault();
        flee(e.clientX, e.clientY);
      }}
      onClick={() => flee()}
      animate={offset}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className="relative z-40 min-h-11 w-52 cursor-pointer rounded-full border border-champagne/25 bg-[#2a0d18] px-6 py-2 text-sm font-medium whitespace-nowrap text-champagne/80 ltr:text-xs ltr:tracking-[0.28em]"
    >
      {labels[tries % labels.length]}
    </motion.button>
  );
}
