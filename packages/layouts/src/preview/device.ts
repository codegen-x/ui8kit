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

export type DeviceFrame = { size: (d: DeviceView) => void; name: (title: string) => void; destroy: () => void };

/** the frame document in `host` (its parent sets the width on offer), at `src` (a URL of the same app), named `title` */
export function mountDevice(host: HTMLElement, src: string, title: string, device: DeviceView): DeviceFrame {
  const screen = host.ownerDocument.createElement("iframe");
  screen.className = "ui8-device-screen";
  screen.title = title;
  screen.src = src;
  screen.setAttribute("data-testid", "device-screen");
  host.append(screen);
  let cur = device;
  const fit = (): void => {
    const room = host.parentElement?.clientWidth ?? cur.width;
    host.style.setProperty("--device-width", cur.width + "px");
    host.style.setProperty("--device-height", cur.height + "px");
    host.style.setProperty("--device-scale", String(Math.min(1, room / cur.width)));
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(host.parentElement ?? host);
  return {
    size: (d) => { cur = d; fit(); },
    name: (t) => { screen.title = t; },
    destroy: () => { ro.disconnect(); screen.remove(); },
  };
}
