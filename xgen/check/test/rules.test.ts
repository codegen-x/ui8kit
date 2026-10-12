// The rules group: every detector is proven on its fixtures in svelte, react and vue, and the committed baselines hold.
import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { detect } from "../src/rules/detectors";
import { gate, selfTest, toIr } from "../src/rules";

const repo = join(import.meta.dir, "..", "..", "..");
const ctx = { blockRoot: true, rootsOnBlock: () => undefined };

describe("rules", () => {
  test("self-test fixtures: one violating and one clean file per detector and runtime", () => expect(selfTest(repo)).toEqual([]));
  test("the baselines hold", () => expect(gate(repo).problems).toEqual([]));
  test("the same violation is found in every runtime", () => {
    const svelte = detect(toIr("svelte", `<Block tag="section"><div aria-expanded={open}>Save</div></Block>`), ctx);
    const react = detect(toIr("react", `export function X() { return <Block tag="section"><div aria-expanded={open}>Save</div></Block>; }`), ctx);
    const vue = detect(toIr("vue", `<template><Block tag="section"><div :aria-expanded="open">Save</div></Block></template>`), ctx);
    const kinds = (f: { detector: string }[]): string[] => f.map((x) => x.detector).sort();
    expect(kinds(svelte)).toEqual(["literal-text", "raw-native-tag", "reactive-aria"]);
    expect(kinds(react)).toEqual(kinds(svelte));
    expect(kinds(vue)).toEqual(kinds(svelte));
  });
  test("a static ARIA value and a naming expression are allowed", () => {
    expect(detect(toIr("svelte", `<Block tag="section"><Button aria-pressed={false} aria-label={ui.save} /></Block>`), ctx)).toEqual([]);
  });
});
