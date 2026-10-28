// The device frame of the detail page: the live render of an asset in a document of its own (an iframe of the app's frame route),
// so the kit's breakpoints see the device's viewport (1280, 768 or 390 px) and not the window's, scaled to the width the page
// offers. The frame document is created here, like a canvas host mounts its engine (rule 00: an engine host): the kit has no
// primitive for an embedded document, and the frame is not composition markup. Sizes go through custom properties on the host
// (--device-width, --device-height, --device-scale), set through the CSSOM; the look is .ui8-device and .ui8-device-screen
// (styles/layouts.css).
import type { DeviceView } from "../stock/text";

export const DEVICES: readonly DeviceView[] = [
  { id: "desktop", width: 1280, height: 800 },
  { id: "tablet", width: 768, height: 1024 },
  { id: "phone", width: 390, height: 844 },
];

/** `highlight(i)` outlines the i-th part of the live render (its i-th top-level element); null clears. `reveal(i)` outlines it and
 *  scrolls the frame to it: only on an explicit request (the "locate" button), never on hover, or the frame would scroll under a
 *  pointer that is not over it (a wheel on the page slides the concept rows under the pointer, each row's hover moved the frame) */
export type DeviceFrame = { size: (d: DeviceView) => void; name: (title: string) => void; highlight: (part: number | null) => void; reveal: (part: number) => void; destroy: () => void };
/** "width": the frame takes the width on offer and its own proportions; "contain": it fits the parent's box both ways */
export type DeviceFit = "width" | "contain";

/** the element of a part in the frame document: the i-th child of the frame's root, when the render has one root per part */
function partElement(doc: Document | null, part: number, parts: number): HTMLElement | null {
  const root = doc?.querySelector<HTMLElement>("[data-testid=frame]");
  // the frame's elements belong to its own window: no instanceof against this one
  const kids = root ? ([...root.children] as HTMLElement[]) : [];
  return kids.length === parts ? kids[part] ?? null : null;
}

/** the frame document in `host` (its parent sets the room on offer), at `src` (a URL of the same app), named `title`; `parts`
 *  is the number of parts the render has (for the highlight) */
export function mountDevice(host: HTMLElement, src: string, title: string, device: DeviceView, fit: DeviceFit = "width", parts = 0): DeviceFrame {
  const screen = host.ownerDocument.createElement("iframe");
  screen.className = "ui8-device-screen";
  screen.title = title;
  screen.src = src;
  screen.setAttribute("data-testid", "device-screen");
  host.append(screen);
  let cur = device;
  const resize = (): void => {
    const box = host.parentElement;
    const w = box?.clientWidth ?? cur.width;
    const h = fit === "contain" && box ? box.clientHeight : Infinity;
    host.style.setProperty("--device-width", cur.width + "px");
    host.style.setProperty("--device-height", cur.height + "px");
    host.style.setProperty("--device-scale", String(Math.min(1, w / cur.width, h / cur.height)));
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host.parentElement ?? host);
  let mark: HTMLElement | null = null;
  const highlight = (part: number | null, scroll = false): void => {
    let doc: Document | null = null;
    try { doc = screen.contentDocument; } catch { return; } // another origin: no highlight
    mark?.removeAttribute("data-ui8-highlight");
    mark = null;
    if (part === null || !doc) return;
    const el = partElement(doc, part, parts);
    if (!el) return;
    el.setAttribute("data-ui8-highlight", "");
    mark = el;
    if (!scroll) return;
    const top = el.getBoundingClientRect().top + (doc.defaultView?.scrollY ?? 0);
    doc.defaultView?.scrollTo({ top: Math.max(0, top - 16), behavior: "smooth" });
  };
  return {
    size: (d) => { cur = d; resize(); },
    name: (t) => { screen.title = t; },
    highlight: (part) => highlight(part),
    reveal: (part) => highlight(part, true),
    destroy: () => { ro.disconnect(); screen.remove(); },
  };
}
