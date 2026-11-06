/**
 * Fetches the rest of the story in the background, one piece at a time, once the
 * first screen is showing. Nothing waits on this; it only makes later scenes instant.
 */
export function preloadExperience() {
  const pieces = [
    () => import("@/components/scenes/MysteryScene"),
    () => import("@/components/scenes/MemoriesScene"),
    () => import("@/components/scenes/WhyYouScene"),
    () => import("@/components/scenes/PromiseScene"),
    () => import("@/components/scenes/ProposalScene"),
    () => import("@/components/3d/RingBox"),
  ];
  let cancelled = false;
  const run = async () => {
    for (const load of pieces) {
      if (cancelled) return;
      await load().catch(() => undefined);
    }
  };
  // Safari has no requestIdleCallback.
  const timer = setTimeout(() => void run(), 1200);
  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}
