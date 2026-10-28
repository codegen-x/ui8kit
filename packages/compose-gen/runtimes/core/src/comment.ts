// The text of a generated comment (docs of specs, parts and fields), the same in every runtime: it can close no comment and holds
// no template syntax, so a doc can neither end the comment it sits in (`*/`, `-->`, `#}`, `*}`) nor be read as template code
// ({{ }}, {% %}, {= }, { } of Svelte, templ or JSX). Braces become fullwidth braces (U+FF5B, U+FF5D: `{0}` still reads as a
// placeholder), control characters go (line breaks too, unless the
// comment keeps them), and the comment delimiters are split with a space.
const CONTROLS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u2028\u2029]/g;

/** a text that is safe inside any generated comment: multiline keeps its line breaks (a block comment), else they become spaces */
export function commentText(text: string, multiline = false): string {
  let s = text.replace(/\r\n?/g, "\n").replace(CONTROLS, "").replace(/\t/g, " ");
  if (!multiline) s = s.replace(/\n/g, " ");
  return s
    .replace(/\{/g, "\uff5b").replace(/\}/g, "\uff5d")
    .replace(/\*\//g, "* /").replace(/\/\*/g, "/ *")
    .replace(/<!--/g, "<! --").replace(/--!?>/g, (m) => m.replace(">", " >"));
}

/** a string literal of a generated template (Twig, Latte, Jinja2, Go): an error on a control character, which no literal of a
 * spec has a use for; the runtime quotes it (inside a quoted literal {{ }}, {% %}, {= } are inert text, test/generator-safety) */
export function literalText(s: string): string {
  const bad = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.exec(s);
  if (bad) throw new Error(`a literal holds the control character U+${bad[0].charCodeAt(0).toString(16).padStart(4, "0")}: ${JSON.stringify(s)}`);
  return s;
}
