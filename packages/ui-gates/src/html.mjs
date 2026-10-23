// Rendered-HTML gate: html-validate (HTML5 + content model, e.g. no <div> in <p>, no interactive inside interactive)
// and axe-core in jsdom (ARIA, landmarks, form labels). Input: [{ id, html }] fragments or full documents.
import { HtmlValidate } from "html-validate";
import { JSDOM, VirtualConsole } from "jsdom";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

const axeSource = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");

/** A fragment becomes a minimal valid document: lang, title, one <main> landmark. */
export const wrap = (html) => (/^\s*<!doctype/i.test(html) ? html : `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>case</title></head><body><main>${html}</main></body></html>`);

const ALIAS = { classname: "class", htmlfor: "for", httpequiv: "http-equiv", acceptcharset: "accept-charset" };
/**
 * react-dom can print React spellings (camelCase names such as fetchPriority, className/htmlFor from a raw spread) that the
 * browser treats case-insensitively but html-validate flags: attribute names of HTML elements are lowercased (React aliases
 * mapped) before validation. SVG/MathML keep their case (viewBox, preserveAspectRatio are case-sensitive there).
 */
export function normalizeReactAttrs(html) {
  let foreign = 0;
  return html.replace(/<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g, (m, close, tag, attrs, self) => {
    const t = tag.toLowerCase();
    if (close) { if ((t === "svg" || t === "math") && foreign > 0) foreign--; return m; }
    const inForeign = foreign > 0 || t === "svg" || t === "math";
    if ((t === "svg" || t === "math") && !self) foreign++;
    if (inForeign) return m;
    const fixed = attrs.replace(/(\s+)([^\s=>\/]+)/g, (a, sp, name) => `${sp}${ALIAS[name.toLowerCase()] ?? name.toLowerCase()}`);
    return `<${tag}${fixed}${self ? " /" : ""}>`;
  });
}

export const HTML_VALIDATE_CONFIG = {
  extends: ["html-validate:recommended"],
  rules: {
    // presentation choices of a design system, not validity
    "no-inline-style": "off", "attribute-boolean-style": "off", "attribute-empty-style": "off", "no-trailing-whitespace": "off",
    "void-style": "off", "no-redundant-role": "off", "prefer-native-element": "off", "no-implicit-button-type": "off",
    "tel-non-breaking": "off", "text-content": "error", "wcag/h37": "error", "no-dup-id": "error",
  },
};

/**
 * html-validate's text-content does not count a <label for> as the name of a <button> (a labelable element: HTML-AAM gives it
 * the label as accessible name, e.g. the v3 Switch, button[role=switch], named by its field label). Only that case is let through.
 */
function labelledByLabel(document, selector) {
  if (!selector) return false;
  let el = null;
  try { el = document.querySelector(selector); } catch { return false; }
  return !!el && el.tagName === "BUTTON" && [...(el.labels ?? [])].some((l) => l.textContent.trim() !== "");
}

export async function checkHtml(cases, { config = HTML_VALIDATE_CONFIG, axeRules = {} } = {}) {
  const hv = new HtmlValidate(config), out = [];
  for (const c of cases) {
    const doc = wrap(normalizeReactAttrs(c.html));
    const report = await hv.validateString(doc);
    const dom = new JSDOM(doc, { runScripts: "outside-only", virtualConsole: new VirtualConsole() });
    for (const r of report.results) for (const m of r.messages) {
      if (m.ruleId === "text-content" && labelledByLabel(dom.window.document, m.selector)) continue;
      out.push({ id: c.id, tool: "html-validate", rule: m.ruleId, message: m.message });
    }
    dom.window.eval(axeSource);
    const res = await dom.window.axe.run(dom.window.document, { rules: { "color-contrast": { enabled: false }, ...axeRules }, resultTypes: ["violations"] });
    for (const v of res.violations) out.push({ id: c.id, tool: "axe", rule: v.id, message: `${v.help}: ${v.nodes.map((n) => n.html).join(" | ").slice(0, 300)}` });
    dom.window.close();
  }
  return out;
}
