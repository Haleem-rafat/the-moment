"use client";

import { useEffect, useState } from "react";
import { SCENES, STORAGE_KEY } from "@/lib/constants";

interface Progress {
  index: number;
  furthest: number;
}

function readStoredProgress(): Progress | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { index, furthest } = JSON.parse(raw) as Progress;
    const last = SCENES.length - 1;
    if (!Number.isInteger(index) || !Number.isInteger(furthest)) return null;
    if (furthest < 0 || furthest > last || index < 0 || index > furthest) return null;
    return { index, furthest };
  } catch {
    return null;
  }
}

/**
 * Moves through the story one scene at a time. She can return to any scene she
 * has already seen but can't jump ahead. Progress survives a reload, and the
 * phone's back button steps back a scene instead of leaving the site.
 */
export function useSceneNavigation() {
  const [progress, setProgress] = useState<Progress>({ index: 0, furthest: 0 });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readStoredProgress();
    if (stored) setProgress(stored);
    window.history.replaceState({ sceneIndex: stored?.index ?? 0 }, "");
    setHydrated(true);

    const onPopState = (event: PopStateEvent) => {
      const target = event.state?.sceneIndex;
      if (typeof target !== "number") return;
      setProgress((p) => ({ ...p, index: Math.min(target, p.furthest) }));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Private browsing can block storage; the story still works without it.
    }
  }, [progress, hydrated]);

  const next = () => {
    const index = Math.min(progress.index + 1, SCENES.length - 1);
    window.history.pushState({ sceneIndex: index }, "");
    setProgress({ index, furthest: Math.max(progress.furthest, index) });
  };

  const goTo = (target: number) => {
    if (target > progress.furthest || target === progress.index) return;
    window.history.pushState({ sceneIndex: target }, "");
    setProgress({ ...progress, index: target });
  };

  return {
    hydrated,
    index: progress.index,
    furthest: progress.furthest,
    scene: SCENES[progress.index],
    next,
    goTo,
  };
}
