// The procedural image recipes by id (see taste.ts RECIPES). Every recipe takes `v` (a variant number) and `class`.
import type { Component } from "svelte";
import type { Recipe } from "@ui8kit/taste-data/taste";
import Conic from "./conic.svelte";
import Dots from "./dots.svelte";
import Duotone from "./duotone.svelte";
import Flat from "./flat.svelte";
import Geometric from "./geometric.svelte";
import Glass from "./glass.svelte";
import Grain from "./grain.svelte";
import Mesh from "./mesh.svelte";
import Rings from "./rings.svelte";
import Stripes from "./stripes.svelte";

export type RecipeProps = { v?: number; class?: string };

export const RECIPE: Record<Recipe, Component<RecipeProps>> = {
  mesh: Mesh, grain: Grain, duotone: Duotone, geometric: Geometric, glass: Glass,
  flat: Flat, rings: Rings, stripes: Stripes, dots: Dots, conic: Conic,
};
export { Conic, Dots, Duotone, Flat, Geometric, Glass, Grain, Mesh, Rings, Stripes };
