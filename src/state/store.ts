import { create } from "zustand";
import { generate } from "../core/generate";
import { samplesFromStroke } from "../core/curves";
import type { ArchetypeName } from "../core/archetypes";
import type { Scene, Pt } from "../core/types";

interface State {
  archetype: ArchetypeName;
  seed: number;
  light: number;
  showJoints: boolean;
  scene: Scene; // derived from (archetype, seed); never mutated
  drawMode: "auto" | "draw"; // whether to autogenerate or take user drawing input
  setArchetype: (a: ArchetypeName) => void;
  setSeed: (s: number) => void;
  regenerate: () => void;
  setLight: (l: number) => void;
  setShowJoints: (v: boolean) => void;
  setDrawMode: (m: "auto" | "draw") => void;
  setStroke: (samples: Sample[]) => void;
}

const INITIAL_SEED = 69;

export const useStore = create<State>()((set, get) => ({
  archetype: "serpentine",
  seed: INITIAL_SEED,
  light: -Math.PI / 4,
  showJoints: true,
  scene: generate("serpentine", INITIAL_SEED),
  drawMode: "draw",

  setArchetype: (archetype) =>
    set({ archetype, scene: generate(archetype, get().seed) }),
  setSeed: (seed) => set({ seed, scene: generate(get().archetype, seed) }),
  regenerate: () => {
    const seed = Math.floor(Math.random() * 1_000_000);
    set({ seed, scene: generate(get().archetype, seed) });
  },
  generateFromStroke: (stroke: Pt[]) => {
    const mainCurveSamples = samplesFromStroke(stroke);
    console.log(mainCurveSamples);
    const seed = Math.floor(Math.random() * 1_000_000);
    set({
      seed,
      scene: generate(get().archetype, seed, mainCurveSamples),
    });
  },
  setLight: (light) => set({ light }),
  setShowJoints: (showJoints) => set({ showJoints }),
  setDrawMode: (mode) =>
    set({
      drawMode: mode,
      scene:
        mode === "auto" ? generate(get().archetype, get().seed) : get().scene,
    }),
  setStroke: (s) => set({ scene: generate(get().archetype, get().seed, s) }),
}));
