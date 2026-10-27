// The live screen of a taste card: a 1440 × 1080 taste screen laid out at its own size and scaled to the width of the card's frame
// (the scale is a custom property, --shot-scale, set on the frame through the CSSOM, not as markup). `onvisible` reports whether the
// frame is within 400 px of the screen, both ways: the app shows a snapshot or a live screen only while it is.
export const SHOT_WIDTH = 1440;

export function observeShot(el: HTMLElement, width: number, onvisible: (visible: boolean) => void): () => void {
  const fit = (): void => { if (el.clientWidth) el.style.setProperty("--shot-scale", String(el.clientWidth / width)); };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(el);
  const io = new IntersectionObserver((entries) => onvisible(entries.some((e) => e.isIntersecting)), { rootMargin: "400px 0px" });
  io.observe(el);
  return () => { ro.disconnect(); io.disconnect(); };
}
