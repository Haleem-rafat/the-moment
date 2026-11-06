export const SCENES = [
  "invitation",
  "mystery",
  "memories",
  "why-you",
  "promise",
  "proposal",
] as const;

export type Scene = (typeof SCENES)[number];

export interface SceneProps {
  onNext: () => void;
  /** She has already been past this scene, so nothing should make her wait again. */
  revisit: boolean;
}

export const STORAGE_KEY = "the-moment:progress";

/** How many gold particles float behind each scene, from 0 to 1. */
export const PARTICLE_DENSITY: Record<Scene, number> = {
  invitation: 0.7,
  mystery: 0.8,
  memories: 0.35,
  "why-you": 0.5,
  promise: 0.4,
  proposal: 0.25,
};

/** Music volume at each point of the story. */
export const MUSIC_LEVEL = {
  base: 0.8,
  hush: 0.14,
  swell: 1,
  gentle: 0.5,
} as const;
