// The registry of the taste screens: every .svelte file in this folder, by file name (the taste id in tastes.ts).
import type { Component } from "svelte";
import type { Deck } from "@ui8kit/taste-data/copy";

const modules = import.meta.glob<Component<{ c: Deck }>>("./*.svelte", { eager: true, import: "default" });

export const SCREENS: Record<string, Component<{ c: Deck }>> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [path.replace(/^\.\//, "").replace(/\.svelte$/, ""), mod]),
);
