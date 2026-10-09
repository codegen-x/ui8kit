// The picks of the panorama, shared with the corner: how many cards are outlined and how to send them.
// The panorama view owns the cards and registers `send`; the Send button in the corner reads `count`.

export const picks = $state<{ count: number; send: (() => Promise<void>) | null }>({ count: 0, send: null });

/** the `cards` URL parameter: none = outline only, all = picks mean KEEP, exclude = picks mean EXCLUDE; unknown = none */
export type CardsMode = "none" | "keep" | "exclude";
export function cardsMode(search: string = location.search): CardsMode {
  const v = new URLSearchParams(search).get("cards");
  return v === "all" ? "keep" : v === "exclude" ? "exclude" : "none";
}
export const PICKS_KEY: Record<CardsMode, string> = { none: "discovery-picked", keep: "discovery-picked", exclude: "discovery-picked-exclude" };

/** one picked card: its taste screen and the row it sits on, counted from the top of the panorama */
export type Pick = { id: string; row: number };

/** the picked cards as { id, row }, deduped by screen id within a row (the screen id, not the slot) */
export function pickedCards(slots: number[], of: (slot: number) => Pick): Pick[] {
  const seen = new Set<string>();
  const out: Pick[] = [];
  for (const slot of slots) {
    const pick = of(slot);
    const key = `${pick.row}:${pick.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(pick);
  }
  return out;
}

/**
 * The body of POST /__discovery. One row (the way the panorama is curated, one row at a time) is { ids, row };
 * picks that span more than one row are sent per card as { picks: [{ id, row }] }.
 */
export type DiscoveryBody = ({ ids: string[]; row: number } | { picks: Pick[] }) & { mode?: "exclude" };
export function discoveryBody(picks: Pick[], mode: "keep" | "exclude" = "keep"): DiscoveryBody {
  const rows = new Set(picks.map((p) => p.row));
  const extra = mode === "exclude" ? { mode } : {};
  if (rows.size === 1) return { ids: picks.map((p) => p.id), row: picks[0]!.row, ...extra };
  return { picks, ...extra };
}

/**
 * POST the picked screens to the preview server (/__discovery, behind the same Basic Auth as the page: the browser
 * resends the credentials on a same-origin request). True only when the server stored them.
 */
export async function postPicks(body: DiscoveryBody): Promise<boolean> {
  try {
    const res = await fetch("/__discovery", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}
