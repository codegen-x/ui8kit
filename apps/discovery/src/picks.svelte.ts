// The picks of the panorama, shared with the corner: how many cards are outlined and how to send them.
// The panorama view owns the cards and registers `send`; the Send button in the corner reads `count`.

export const picks = $state<{ count: number; send: (() => Promise<void>) | null }>({ count: 0, send: null });

/** the taste screens of the picked cards, deduped (the screen id, not the slot) */
export function pickedScreens(slots: number[], screenOf: (slot: number) => string): string[] {
  return [...new Set(slots.map(screenOf))];
}

/**
 * POST the picked screens to the preview server (/__discovery, behind the same Basic Auth as the page: the browser
 * resends the credentials on a same-origin request). True only when the server stored them.
 */
export async function postPicks(ids: string[]): Promise<boolean> {
  try {
    const res = await fetch("/__discovery", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ ids }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
