// The Jinja-family syntax the emitters print through. Twig is the only dialect today; Jinja2 differs in a handful of
// forms (ternary order, `safe` for `raw`, `is not none`, include with a context dict), so a Jinja2 target is a second
// Dialect object over the same brick and organism emitters, with a Python port of the ui_* helpers.

export interface Dialect {
  name: "twig" | "jinja";
  /** template file suffix: `.html.twig`, `.html.j2` */
  ext: string;
  str(s: string): string;
  hash(entries: Array<[string, string]>): string;
  list(items: string[]): string;
  /** `a ?? b` (b when a is null or missing) */
  orNull(a: string, b: string): string;
  ternary(c: string, a: string, b: string): string;
  not(a: string): string;
  /** a value printed without escaping (markup the template built) */
  raw(e: string): string;
  /** an escaped value */
  out(e: string): string;
  comment(text: string): string;
  set(name: string, value: string): string;
  /** a captured block: open, close */
  capture(name: string): [string, string];
  if(test: string): string;
  elseif(test: string): string;
  else: string;
  endif: string;
  forIn(item: string, list: string): string;
  /** the zero-based index of the innermost loop */
  loopIndex: string;
  endfor: string;
  /** another template rendered with only the given variables */
  include(template: string, vars: string): string;
  /** a template named by an expression (a slot fill descriptor) */
  includeExpr(template: string, vars: string): string;
  /** a hash with another merged over it */
  merge(a: string, b: string): string;
}

const q = (s: string): string => `'${s.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

export const twig: Dialect = {
  name: "twig",
  ext: ".html.twig",
  str: q,
  hash: (entries) => `{${entries.map(([k, v]) => `${q(k)}: ${v}`).join(", ")}}`,
  list: (items) => `[${items.join(", ")}]`,
  orNull: (a, b) => `(${a} ?? ${b})`,
  ternary: (c, a, b) => `(${c} ? ${a} : ${b})`,
  not: (a) => `not (${a})`,
  raw: (e) => `{{ ${e}|raw }}`,
  out: (e) => `{{ ${e} }}`,
  comment: (text) => `{#- ${text.replace(/#}/g, "# }")} -#}`,
  set: (name, value) => `{%- set ${name} = ${value} -%}`,
  capture: (name) => [`{%- set ${name} -%}`, `{%- endset -%}`],
  if: (test) => `{%- if ${test} %}`,
  elseif: (test) => `{%- elseif ${test} %}`,
  else: `{%- else %}`,
  endif: `{%- endif %}`,
  forIn: (item, list) => `{%- for ${item} in ${list} %}`,
  loopIndex: "loop.index0",
  endfor: `{%- endfor %}`,
  include: (template, vars) => `{{ include(${q(template)}, ${vars}, with_context = false) }}`,
  includeExpr: (template, vars) => `{{ include(${template}, ${vars}, with_context = false) }}`,
  merge: (a, b) => `${a}|merge(${b})`,
};

/** the dialect a Jinja2 target would use (not emitted yet; kept here so the emitters stay dialect-neutral) */
export const jinja: Dialect = {
  ...twig,
  name: "jinja",
  ext: ".html.j2",
  hash: (entries) => `{${entries.map(([k, v]) => `${q(k)}: ${v}`).join(", ")}}`,
  orNull: (a, b) => `ui_def(${a}, ${b})`,
  ternary: (c, a, b) => `(${a} if ${c} else ${b})`,
  raw: (e) => `{{ ${e}|safe }}`,
  comment: (text) => `{#- ${text.replace(/#}/g, "# }")} -#}`,
  elseif: (test) => `{%- elif ${test} %}`,
  include: (template, vars) => `{{ ui_include(${q(template)}, ${vars}) }}`,
  includeExpr: (template, vars) => `{{ ui_include(${template}, ${vars}) }}`,
  merge: (a, b) => `ui_merge(${a}, ${b})`,
};
