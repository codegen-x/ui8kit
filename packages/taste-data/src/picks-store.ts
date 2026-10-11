// Where the 10 picks live between visits, shared by Discovery (the hop) and the magazine (the reader). Plain data and functions;
// the browser is reached through an injectable Env so the tests run without a DOM.
//
// Schema v1: localStorage `magazine:v1:picks` = {"v":1,"picks":[10 StyleKeys]} (the earlier bare array is still read). Because
// storage can be blocked or wiped (private mode, Safari ITP, an interstitial page, tablets), every write is mirrored to
// sessionStorage, a first-party cookie (`mgpicks`, "~"-encoded like ?picks=) and memory; every read tries them in that order and
// takes the first source holding EXACTLY MIN_PICKS valid, distinct StyleKeys (anything else is dropped as corrupt).
import { decodePicks, encodePicks, MIN_PICKS, parseStyleKey, type StyleKey } from "./picks";

export const STORE_KEY = "magazine:v1:picks";
export const COOKIE_NAME = "mgpicks";
export const SCHEMA = 1;

export interface KV { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }
export interface Env { local?: KV | null; session?: KV | null; cookie?: { get(): string; set(v: string): void } | null; secure?: boolean }
export type StoreSource = "local" | "session" | "cookie" | "memory";

let memory: StyleKey[] = [];

/** the browser's storages, each guarded: merely touching `localStorage` can throw when it is blocked */
export function browserEnv(): Env {
  const pick = (f: () => KV): KV | null => { try { return f(); } catch { return null; } };
  return {
    local: pick(() => localStorage),
    session: pick(() => sessionStorage),
    cookie: typeof document === "undefined" ? null : { get: () => document.cookie, set: (v) => { document.cookie = v; } },
    secure: typeof location !== "undefined" && location.protocol === "https:",
  };
}

/** the keys when they are exactly MIN_PICKS distinct valid styles, else [] */
export function exactPicks(keys: readonly unknown[]): StyleKey[] {
  const out: StyleKey[] = [];
  for (const k of keys) {
    if (typeof k !== "string" || !parseStyleKey(k) || out.includes(k)) return [];
    out.push(k);
  }
  return out.length === MIN_PICKS ? out : [];
}

/** a stored string (schema v1 object, or the earlier bare array) as picks; [] when invalid, of another version or not exactly 10 */
export function parseStored(raw: string | null | undefined): StyleKey[] {
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    if (Array.isArray(v)) return exactPicks(v.map((k) => (typeof k === "string" ? k.replace(/~/g, "|") : k)));
    if (v && typeof v === "object" && (v as { v?: unknown }).v === SCHEMA && Array.isArray((v as { picks?: unknown }).picks)) return exactPicks((v as { picks: unknown[] }).picks);
  } catch { /* corrupt */ }
  return [];
}

export const serialize = (keys: readonly StyleKey[]): string => JSON.stringify({ v: SCHEMA, picks: keys });

function fromCookie(header: string): StyleKey[] {
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0 || part.slice(0, i).trim() !== COOKIE_NAME) continue;
    try { return exactPicks(decodePicks(decodeURIComponent(part.slice(i + 1).trim()))); } catch { return []; }
  }
  return [];
}

/** the first source holding a valid set of picks */
export function readStore(env: Env = browserEnv()): { picks: StyleKey[]; from: StoreSource | null } {
  const tries: [StoreSource, () => StyleKey[]][] = [
    ["local", () => parseStored(env.local?.getItem(STORE_KEY))],
    ["session", () => parseStored(env.session?.getItem(STORE_KEY))],
    ["cookie", () => fromCookie(env.cookie?.get() ?? "")],
    ["memory", () => exactPicks(memory)],
  ];
  for (const [from, read] of tries) {
    try { const picks = read(); if (picks.length) return { picks, from }; } catch { /* source unavailable */ }
  }
  return { picks: [], from: null };
}

/** save to every source that works; false (and nothing written) unless the keys are exactly 10 valid styles */
export function writeStore(keys: readonly StyleKey[], env: Env = browserEnv()): boolean {
  const picks = exactPicks(keys);
  if (!picks.length) return false;
  memory = picks;
  const body = serialize(picks);
  try { env.local?.setItem(STORE_KEY, body); } catch { /* blocked or full */ }
  try { env.session?.setItem(STORE_KEY, body); } catch { /* blocked */ }
  try { env.cookie?.set(`${COOKIE_NAME}=${encodeURIComponent(encodePicks(picks))}; Path=/; Max-Age=31536000; SameSite=Lax${env.secure ? "; Secure" : ""}`); } catch { /* blocked */ }
  return true;
}

/** forget the picks everywhere (Reset) */
export function clearStore(env: Env = browserEnv()): void {
  memory = [];
  try { env.local?.removeItem(STORE_KEY); } catch { /* blocked */ }
  try { env.session?.removeItem(STORE_KEY); } catch { /* blocked */ }
  try { env.cookie?.set(`${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`); } catch { /* blocked */ }
}
