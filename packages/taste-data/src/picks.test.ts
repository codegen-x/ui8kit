import { describe, expect, test } from "bun:test";
import { decodePicks, encodePicks, magazineUrl, MIN_PICKS, parseStyleKey, styleKey } from "./picks";
import { variantKey } from "./taste";
import { TASTES } from "./tastes";

const A = "t001-poster-mesh|cosmic-night|montserrat+inter|12";
const B = "t012-poster-flat|mocha-mousse|open-sans+open-sans|16";

describe("picks", () => {
  test("MIN_PICKS is 10", () => expect(MIN_PICKS).toBe(10));
  test("parseStyleKey reads the four parts and styleKey writes them back", () => {
    const p = parseStyleKey(A)!;
    expect(p).toEqual({ screen: "t001-poster-mesh", skin: "cosmic-night", fonts: { display: "montserrat", body: "inter" }, radius: 12 });
    expect(styleKey(p)).toBe(A);
  });
  test("styleKey is variantKey", () => {
    const t = TASTES[3]!;
    expect(styleKey({ screen: t.id, skin: t.skin, fonts: t.fonts, radius: t.radius })).toBe(variantKey({ screen: t.id, skin: t.skin, fonts: t.fonts, radius: t.radius }));
  });
  test("every screen in its own taste is a valid key", () => {
    for (const t of TASTES) expect(parseStyleKey(variantKey({ screen: t.id, skin: t.skin, fonts: t.fonts, radius: t.radius }))).not.toBeNull();
  });
  test("unknown parts are rejected", () => {
    for (const bad of ["", "x", A.replace("cosmic-night", "nope"), A.replace("montserrat", "comic"), A.replace("|12", "|13"), A.replace("t001-poster-mesh", "t999-none"), A + "|1"]) {
      expect(parseStyleKey(bad)).toBeNull();
    }
  });
  test("encode writes ~ for | and keeps +", () => {
    expect(encodePicks([A, B])).toBe("t001-poster-mesh~cosmic-night~montserrat+inter~12,t012-poster-flat~mocha-mousse~open-sans+open-sans~16");
  });
  test("decode round-trips, also after URLSearchParams turned + into a space", () => {
    const v = encodePicks([A, B]);
    expect(decodePicks(v)).toEqual([A, B]);
    expect(decodePicks(new URLSearchParams("picks=" + v).get("picks"))).toEqual([A, B]);
    expect(decodePicks(decodeURIComponent(encodeURIComponent(v)))).toEqual([A, B]);
  });
  test("decode drops invalid and duplicate keys and keeps order", () => {
    expect(decodePicks(`${encodePicks([B])},junk,${encodePicks([A])},${encodePicks([B])}`)).toEqual([B, A]);
    expect(decodePicks(null)).toEqual([]);
    expect(decodePicks("")).toEqual([]);
  });
  test("magazineUrl is same-origin", () => {
    expect(magazineUrl([A])).toBe("/magazine/?picks=t001-poster-mesh~cosmic-night~montserrat+inter~12");
  });
});
