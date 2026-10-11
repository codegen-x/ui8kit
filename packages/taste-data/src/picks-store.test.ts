import { describe, expect, test } from "bun:test";
import { decodePicks, encodePicks } from "./picks";
import { clearStore, COOKIE_NAME, exactPicks, parseStored, readStore, serialize, STORE_KEY, writeStore, type Env, type KV } from "./picks-store";

const URL10 = "t071-poster-dots~bubblegum~montserrat+open-sans~0,t094-dense-flat~amber-minimal~open-sans+open-sans~4,t143-poster-stripes~neo-brutalism~montserrat+open-sans~0,t053-fullbleed-geometric~bubblegum~onest+inter~4,t033-fullbleed-rings~doom-64~onest+inter~16,t081-poster-conic~neo-brutalism~onest+inter~8,t053-fullbleed-geometric~amber-minimal~onest+inter~4,t053-fullbleed-geometric~supabase~onest+inter~0,t093-fullbleed-dots~sky~montserrat+inter~12,t053-fullbleed-geometric~claude~onest+inter~8";
const KEYS = decodePicks(URL10);

const mem = (): KV & { m: Map<string, string> } => { const m = new Map<string, string>(); return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) }; };
const blocked: KV = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
const jar = () => { const c = new Map<string, string>(); return { c, get: () => [...c].map(([k, v]) => `${k}=${v}`).join("; "), set: (s: string) => { const [kv, ...attrs] = s.split("; "); const [k, v] = [kv!.slice(0, kv!.indexOf("=")), kv!.slice(kv!.indexOf("=") + 1)]; if (attrs.includes("Max-Age=0")) c.delete(k); else c.set(k, v); } }; };

describe("picks-store", () => {
  test("the URL from the bug report holds 10 valid distinct styles", () => {
    expect(KEYS.length).toBe(10);
    expect(exactPicks(KEYS)).toEqual(KEYS);
  });
  test("write then read from every single source", () => {
    const env: Env = { local: mem(), session: mem(), cookie: jar() };
    expect(writeStore(KEYS, env)).toBe(true);
    expect(readStore(env)).toEqual({ picks: KEYS, from: "local" });
    expect(readStore({ session: env.session })).toEqual({ picks: KEYS, from: "session" });
    expect(readStore({ cookie: env.cookie })).toEqual({ picks: KEYS, from: "cookie" });
    expect(readStore({}).from).toBe("memory");
  });
  test("localStorage wiped: the cookie and sessionStorage restore", () => {
    const env: Env = { local: mem(), session: mem(), cookie: jar() };
    writeStore(KEYS, env);
    (env.local as ReturnType<typeof mem>).m.clear();
    expect(readStore(env).from).toBe("session");
    (env.session as ReturnType<typeof mem>).m.clear();
    expect(readStore(env)).toEqual({ picks: KEYS, from: "cookie" });
  });
  test("all storages blocked: memory keeps it, nothing throws", () => {
    const env: Env = { local: blocked, session: blocked, cookie: { get() { throw new Error("x"); }, set() { throw new Error("x"); } } };
    expect(writeStore(KEYS, env)).toBe(true);
    expect(readStore(env)).toEqual({ picks: KEYS, from: "memory" });
    clearStore(env);
    expect(readStore(env).from).toBeNull();
  });
  test("a corrupt or incomplete source is skipped for the next one", () => {
    const local = mem(), session = mem();
    local.setItem(STORE_KEY, "{not json");
    session.setItem(STORE_KEY, serialize(KEYS));
    expect(readStore({ local, session }).from).toBe("session");
    local.setItem(STORE_KEY, serialize(KEYS.slice(0, 9)));
    expect(readStore({ local, session }).from).toBe("session");
  });
  test("validation: exactly 10 valid distinct keys", () => {
    expect(parseStored(serialize(KEYS))).toEqual(KEYS);
    expect(parseStored(JSON.stringify(KEYS))).toEqual(KEYS); // the earlier bare array
    expect(parseStored(JSON.stringify(KEYS.map((k) => k.replace(/\|/g, "~"))))).toEqual(KEYS);
    expect(parseStored(JSON.stringify({ v: 2, picks: KEYS }))).toEqual([]); // another schema version
    expect(parseStored(serialize([...KEYS.slice(0, 9), "bogus|key"]))).toEqual([]);
    expect(parseStored(serialize([...KEYS.slice(0, 9), KEYS[0]!]))).toEqual([]); // a duplicate
    expect(parseStored(serialize([...KEYS, KEYS[0]!]))).toEqual([]); // eleven
    expect(parseStored(JSON.stringify({ v: 1, picks: [1, 2, null] }))).toEqual([]);
    expect(parseStored(null)).toEqual([]);
    expect(parseStored("")).toEqual([]);
  });
  test("an invalid set is never written", () => {
    const env: Env = { local: mem(), cookie: jar() };
    expect(writeStore(KEYS.slice(0, 9), env)).toBe(false);
    expect((env.local as ReturnType<typeof mem>).m.size).toBe(0);
  });
  test("cookie value is URL-encoded and clear removes every mirror", () => {
    const env: Env = { local: mem(), session: mem(), cookie: jar() };
    writeStore(KEYS, env);
    const raw = (env.cookie as ReturnType<typeof jar>).c.get(COOKIE_NAME)!;
    expect(raw).not.toMatch(/[,; ]/);
    expect(decodeURIComponent(raw)).toBe(encodePicks(KEYS));
    clearStore(env);
    expect(readStore(env).from).toBeNull();
  });
});
