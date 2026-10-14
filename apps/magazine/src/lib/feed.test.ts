import { describe, expect, test } from "bun:test";
import { decodePicks, parseStyleKey } from "@ui8kit/taste-data/picks";
import { closest, deriveTune, insertAt, isDerived, opposite, readTune, structure, tuneSearch, unexpected, unexpectedPages } from "./feed";

const PICKS = decodePicks("t071-poster-dots~bubblegum~montserrat+open-sans~0,t094-dense-flat~amber-minimal~open-sans+open-sans~4,t143-poster-stripes~neo-brutalism~montserrat+open-sans~0,t053-fullbleed-geometric~bubblegum~onest+inter~4,t033-fullbleed-rings~doom-64~onest+inter~16,t081-poster-conic~neo-brutalism~onest+inter~8,t053-fullbleed-geometric~amber-minimal~onest+inter~4,t053-fullbleed-geometric~supabase~onest+inter~0,t093-fullbleed-dots~sky~montserrat+inter~12,t053-fullbleed-geometric~claude~onest+inter~8");

describe("tune", () => {
  const base = deriveTune(PICKS);
  test("derived from the picks", () => {
    expect(base.comp[0]).toBe("full-bleed");
    expect(base.font).toEqual({ display: "onest", body: "inter" });
    expect(base.skins.length).toBe(3);
    expect(base.radius).toBe(4);
    expect(base.task).toBe("any");
  });
  test("only overrides go to the address, and come back", () => {
    expect(tuneSearch("", base, base)).toBe("");
    const t = { ...base, skins: ["claude" as const], radius: 16 as const, task: "shop" as const };
    const s = tuneSearch("picks=a~b,c", t, base);
    expect(s).toBe("picks=a~b,c&sk=claude&r=16&task=shop");
    expect(readTune(s, base)).toEqual(t);
    expect(isDerived(readTune("", base), base)).toBe(true);
  });
  test("invalid parameters fall back to the derived values", () => {
    expect(readTune("sk=nope&r=7&task=x&f=a~b", base)).toEqual(base);
  });
});

describe("feed", () => {
  const tune = deriveTune(PICKS);
  test("closest cards wear the visitor's tokens and say why", () => {
    const c = closest(tune);
    expect(c.length).toBe(8);
    for (const x of c) {
      expect(parseStyleKey(x.key)).not.toBeNull();
      expect(x.skin).toBe(tune.skins[0]);
      expect(x.radius).toBe(tune.radius);
      expect(x.why.length).toBeGreaterThan(0);
    }
  });
  test("same structure: one screen in three different skins", () => {
    const s = structure(tune);
    expect(new Set(s.map((x) => x.screen)).size).toBe(1);
    expect(new Set(s.map((x) => x.skin)).size).toBe(3);
  });
  test("opposite and unexpected cards are valid styles, pages do not repeat", () => {
    for (const x of opposite(tune)) expect(parseStyleKey(x.key)).not.toBeNull();
    expect(unexpectedPages(tune)).toBeGreaterThan(2);
    const a = unexpected(tune, 0).map((x) => x.screen), b = unexpected(tune, 1).map((x) => x.screen);
    expect(a.some((x) => b.includes(x))).toBe(false);
    for (const x of unexpected(tune, 1)) expect(parseStyleKey(x.key)).not.toBeNull();
  });
  test("deterministic", () => expect(closest(deriveTune(PICKS))).toEqual(closest(tune)));
  test("inserts rotate", () => expect([0, 1, 2, 3, 4].map((i) => insertAt(i, "k", (k) => k).kind)).toEqual(["templates", "design", "series", "video", "templates"]));
});
