import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { NAVS, screenNav } from "./nav";

describe("screen menus", () => {
  test("one loader per generated nav module of @ui8kit/app-shared", () => {
    const dir = new URL("../../../shared/app/src/nav/", import.meta.url).pathname;
    const files = readdirSync(dir).filter((f) => f.endsWith(".ts")).map((f) => f.slice(0, -3)).sort();
    expect(Object.keys(NAVS).sort()).toEqual(files);
  });
  test("a menu loads by package name; an unknown screen has none", async () => {
    const nav = await screenNav("ThemeMarketingLandingScreen", "home");
    expect(nav?.links.length).toBeGreaterThan(0);
    expect(await screenNav("NoSuchScreen", "home")).toBeUndefined();
  });
});
