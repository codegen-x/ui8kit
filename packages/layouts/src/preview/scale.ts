// The scale of a preview stage: the stage is laid out at STAGE_WIDTH (a desktop viewport) and scaled to the width of its frame
// through the --preview-scale custom property (set on the frame through the CSSOM, not as markup); `onnear` fires once the frame
// comes within one viewport of the screen (lazy mount inside the page).
export const STAGE_WIDTH = 1280;

export function observeFrame(el: HTMLElement, width: number, onnear: () => void): () => void {
  const fit = (): void => el.style.setProperty("--preview-scale", String(el.clientWidth / width));
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(el);
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { onnear(); io.disconnect(); }
  }, { rootMargin: "100% 0px" });
  io.observe(el);
  return () => { ro.disconnect(); io.disconnect(); };
}
