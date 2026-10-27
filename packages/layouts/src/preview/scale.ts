// The scale of a preview stage: the stage is laid out at the width of a desktop viewport (STAGE_WIDTH, or the window when it is
// narrower: the kit's breakpoints follow the viewport, so a phone sees the phone layout) and scaled to the width of its frame. Both
// go through custom properties (--preview-width, --preview-scale) set on the frame through the CSSOM, not as markup; `onnear` fires
// once the frame comes within one viewport of the screen (lazy mount inside the page).
export const STAGE_WIDTH = 1280;

export function observeFrame(el: HTMLElement, width: number, onnear: () => void): () => void {
  const fit = (): void => {
    const w = Math.min(width, window.innerWidth);
    el.style.setProperty("--preview-width", w + "px");
    el.style.setProperty("--preview-scale", String(el.clientWidth / w));
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(el);
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { onnear(); io.disconnect(); }
  }, { rootMargin: "100% 0px" });
  io.observe(el);
  return () => { ro.disconnect(); io.disconnect(); };
}
