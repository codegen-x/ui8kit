// compose-gen: the parts of the former xgen generator that the kit-compose organisms, blocks and screens use.
export * as schema from "./schema/src/index";
export { loadSpecs, portableTo } from "./spec/src/index";
export { validateOrganism } from "./screens/src/validate-view";
export { partsFromKit } from "./parts";
export { loadInputs, indexParts, tierDir, fileName, type OrganismSpec } from "./screens/src/index";
export { emitPreset, type GeneratedFile } from "./runtimes/core/src/index";
export { emitOrganism as reactOrganism } from "./runtimes/react/src/index";
export { emitOrganism as svelteOrganism } from "./runtimes/svelte/src/index";
export { emitOrganism as vueOrganism } from "./runtimes/vue/src/index";
export { emitOrganism as solidOrganism } from "./runtimes/solid/src/index";
export { blockCases } from "./check/src/templ/blocks";
export { normalizeHtml } from "./check/src/templ/normalize";
/** the root of the specs, content and fixtures */
export const ROOT = import.meta.dir;
