// The theme of the page as state: snapshots are made per theme, so a card reads `theme.dark` and re-resolves when the kit toggle flips it.
const root = typeof document === "undefined" ? null : document.documentElement;
export const theme = $state({ dark: root?.classList.contains("dark") ?? true });
if (root) {
  new MutationObserver(() => { theme.dark = root.classList.contains("dark"); }).observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
}
