// Hand-written compositions (no single primitive): ThemeToggle, SheetTrigger, SheetClose (Button + Lucide icons in Icon),
// Breadcrumb (Box nav/ol/li + Link / Text span). One place, 8 runtimes; recipes from variants/, icons = Lucide path data.
import { RECIPES } from "./recipes";

const svg = (inner: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
/** Lucide icons (lucide.dev: sun, moon, menu, x) */
export const LUCIDE: Record<string, string> = {
  sun: svg(`<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>`),
  moon: svg(`<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>`),
  menu: svg(`<path d="M4 12h16"></path><path d="M4 6h16"></path><path d="M4 18h16"></path>`),
  x: svg(`<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>`),
};
const jsx = (s: string) => s.replace(/stroke-(width|linecap|linejoin)=/g, (_, k: string) => `stroke${k[0].toUpperCase()}${k.slice(1)}=`);

type IconButton = { recipe: string; ui: string; label: string; fixed: Record<string, string>; controls: boolean; icons: [string, string][] };
export const ICON_BUTTONS: Record<string, IconButton> = {
  ThemeToggle: { recipe: "themetoggle", ui: "theme-toggle", label: "Dark mode", fixed: { "aria-pressed": "false" }, controls: false, icons: [["hidden size-5 dark:block", "sun"], ["block size-5 dark:hidden", "moon"]] },
  SheetTrigger: { recipe: "sheettrigger", ui: "sheet-trigger", label: "Open menu", fixed: { "aria-expanded": "false", "aria-haspopup": "dialog" }, controls: true, icons: [["block size-5 in-aria-expanded:hidden", "menu"], ["hidden size-5 in-aria-expanded:block", "x"]] },
  SheetClose: { recipe: "sheettrigger", ui: "sheet-close", label: "Close menu", fixed: {}, controls: false, icons: [["size-5", "x"]] },
};
export const MANUAL = [...Object.keys(ICON_BUTTONS), "Breadcrumb"];
for (const b of Object.values(ICON_BUTTONS)) if (!RECIPES[b.recipe]) throw new Error(`manual: no recipe ${b.recipe}`);

const BC = { nav: "text-sm", ol: "flex flex-wrap items-center gap-2", li: "inline-flex items-center", item: "text-sm",
  current: "font-medium", disabled: "text-muted-foreground", link: "text-primary underline-offset-4 hover:underline" };
const K = "../../../../kit";
const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const lit = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => ` ${k}=${JSON.stringify(v)}`).join("");
const phpArr = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => `'${k}' => '${v}'`).join(", ");

function ib(rt: string, name: string, b: IconButton, HEAD: string): [string, string][] {
  const ctrl = b.controls;
  const icons = (f: (cls: string, svg: string) => string) => b.icons.map(([c, i]) => f(c, LUCIDE[i])).join("");
  switch (rt) {
    case "react": return [[`react/src/compose/${kebab(name)}.tsx`, `// ${HEAD}
import type { ComponentProps } from "react";
import { Button as Prim } from "${K}/react/src/ui/button/button";
import { Icon } from "${K}/react/src/ui/icon/icon";
import { cn } from "${K}/react/src/utils";
import { rc } from "./recipes";

export type ${name}Props = Omit<ComponentProps<typeof Prim>, "children"> & { variant?: string; size?: string;${ctrl ? " controls?: string;" : ""} "aria-label"?: string; className?: string };

/** ${name}: Button + Lucide icons (data-ui8kit="${b.ui}" behaviour). */
export function ${name}({ variant, size,${ctrl ? " controls," : ""} "aria-label": ariaLabel, className, ...rest }: ${name}Props) {
  return (
    <Prim type="button" className={cn(rc("${b.recipe}", { variant, size }), className)} data-ui8kit="${b.ui}" aria-label={ariaLabel || ${JSON.stringify(b.label)}}${lit(b.fixed)}${ctrl ? " aria-controls={controls || undefined}" : ""} {...rest}>
      ${icons((c, s) => `<Icon className="${c}">${jsx(s)}</Icon>`)}
    </Prim>
  );
}
`]];
    case "svelte": return [[`svelte/src/compose/${name}.svelte`, `<!-- ${HEAD} -->
<!-- ${name}: Button + Lucide icons (data-ui8kit="${b.ui}" behaviour). -->
<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Prim from "${K}/svelte/src/ui/button/Button.svelte";
  import Icon from "${K}/svelte/src/ui/icon/Icon.svelte";
  import { cn } from "${K}/svelte/src/utils";
  import { rc } from "./recipes";

  let { variant, size,${ctrl ? " controls," : ""} "aria-label": ariaLabel, class: className, ...rest }: Omit<ComponentProps<typeof Prim>, "children"> & { variant?: string; size?: string;${ctrl ? " controls?: string;" : ""} "aria-label"?: string; class?: string } = $props();
</script>

<Prim type="button" class={cn(rc("${b.recipe}", { variant, size }), className)} data-ui8kit="${b.ui}" aria-label={ariaLabel || ${JSON.stringify(b.label)}}${lit(b.fixed)}${ctrl ? " aria-controls={controls || undefined}" : ""} {...rest}>${icons((c, s) => `<Icon class="${c}">${s}</Icon>`)}</Prim>
`]];
    case "vue": return [[`vue/src/compose/${name}.vue`, `<!-- ${HEAD} -->
<!-- ${name}: Button + Lucide icons (data-ui8kit="${b.ui}" behaviour). -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import Prim from "${K}/vue/src/ui/button/Button.vue";
import Icon from "${K}/vue/src/ui/icon/Icon.vue";
import { cn } from "${K}/vue/src/utils";
import { rc } from "./recipes";

defineOptions({ name: "${name}", inheritAttrs: false });
const props = defineProps<{ variant?: string; size?: string;${ctrl ? " controls?: string;" : ""} ariaLabel?: string }>();
const attrs = useAttrs();
const rest = computed(() => {
  const { class: _class, ...r } = attrs;
  return r;
});
const cls = computed(() => cn(rc("${b.recipe}", { variant: props.variant, size: props.size }), attrs.class as string | undefined));
</script>

<template>
  <Prim type="button" :class="cls" data-ui8kit="${b.ui}" :aria-label="props.ariaLabel || ${JSON.stringify(b.label).replace(/"/g, "'")}"${lit(b.fixed)}${ctrl ? ` :aria-controls="props.controls || undefined"` : ""} v-bind="rest">${icons((c, s) => `<Icon class="${c}">${s}</Icon>`)}</Prim>
</template>
`]];
    case "solid": return [[`solid/src/compose/${kebab(name)}.solid.tsx`, `// ${HEAD}
import { splitProps, type ComponentProps } from "solid-js";
import { Button as Prim } from "${K}/solid/src/ui/button/button.solid";
import { Icon } from "${K}/solid/src/ui/icon/icon.solid";
import { cn } from "${K}/solid/src/utils";
import { rc } from "./recipes";

export type ${name}Props = Omit<ComponentProps<typeof Prim>, "children" | "class" | "className"> & { variant?: string; size?: string;${ctrl ? " controls?: string;" : ""} "aria-label"?: string; class?: string; className?: string };

/** ${name}: Button + Lucide icons (data-ui8kit="${b.ui}" behaviour). */
export function ${name}(props: ${name}Props) {
  const [local, rest] = splitProps(props, ["variant", "size",${ctrl ? ` "controls",` : ""} "aria-label", "class", "className"]);
  return (
    <Prim type="button" class={cn(rc("${b.recipe}", { variant: local.variant, size: local.size }), local.class ?? local.className)} data-ui8kit="${b.ui}" aria-label={local["aria-label"] || ${JSON.stringify(b.label)}}${lit(b.fixed)}${ctrl ? " aria-controls={local.controls || undefined}" : ""} {...rest}>
      ${icons((c, s) => `<Icon class="${c}">${s}</Icon>`)}
    </Prim>
  );
}
`]];
    case "jinja2": {
      const fixed = Object.entries({ "data-ui8kit": b.ui, ...b.fixed }).map(([k, v]) => `'${k}': '${v}'`).join(", ");
      return [[`jinja2/src/compose/${kebab(name)}.html.j2`, `{#- ${HEAD}
    ${name}: Button + Lucide icons. Props (p): Variant, Size,${ctrl ? " Controls," : ""} AriaLabel, Class, Attrs. -#}
{%- set a = {${fixed}, 'aria-label': p['AriaLabel'] or '${b.label}'} %}
${ctrl ? "{%- if p['Controls'] %}{%- set _ = a.update({'aria-controls': p['Controls']}) %}{%- endif %}\n" : ""}{%- set _ = a.update(p['Attrs'] or {}) %}
{%- set icons %}${icons((c, s) => `{% with p = {'Class': '${c}'}, children = '${s}'|safe %}{% include 'ui/icon/icon.html.j2' %}{% endwith %}`)}{% endset %}
{%- with p = {'Type': 'button', 'Class': compose_join([compose_rc('${b.recipe}', {'variant': p['Variant'], 'size': p['Size']}), p['Class']]), 'Attrs': a}, children = icons %}{% include 'ui/button/button.html.j2' %}{% endwith %}`]];
    }
    case "twig": return [[`twig/src/compose/${name}.html.twig`, `{# ${HEAD} #}
{# ${name}: Button + Lucide icons. Params: variant, size,${ctrl ? " controls," : ""} ariaLabel, class, attrs. #}
{% set a = {'data-ui8kit': '${b.ui}', ${Object.entries(b.fixed).map(([k, v]) => `'${k}': '${v}', `).join("")}'aria-label': ariaLabel|default('') ?: '${b.label}'}${ctrl ? "|merge(controls|default('') ? {'aria-controls': controls} : {})" : ""}|merge(attrs|default({})) %}
{% set icons %}${icons((c, s) => `{{ include('ui/icon/Icon.html.twig', {class: '${c}', children: '${s}'}, with_context = false)|trim|raw }}`)}{% endset %}
{{ include('ui/button/Button.html.twig', {type: 'button', class: compose_join([compose_rc('${b.recipe}', {variant: variant|default(''), size: size|default('')}), class|default('')]), attrs: a, children: icons}, with_context = false)|trim|raw }}`]];
    case "latte": return [[`latte/src/compose/${name}.latte`, `{* ${HEAD} *}
{* ${name}: Button + Lucide icons. Includes inherit variables: every primitive param this template shadows is passed explicitly. *}
{parameters
  $variant = null,
  $size = null,
  string $controls = '',
  string $ariaLabel = '',
  string $class = '',
  array $attrs = [],
}
{var $a = ['data-ui8kit' => '${b.ui}', ${phpArr(b.fixed)}${Object.keys(b.fixed).length ? ", " : ""}'aria-label' => $ariaLabel !== '' ? $ariaLabel : '${b.label}', ...(${ctrl} && $controls !== '' ? ['aria-controls' => $controls] : []), ...$attrs]}
{capture $icons}${icons((c, s) => `{include '../ui/icon/Icon.latte', size: '', label: '', class: '${c}', attrs: [], children: '${s}'}`)}{/capture}
{include '../ui/button/Button.latte', type: 'button', ariaLabel: '', ariaControls: '', class: \\CodegenX\\Compose\\Latte\\Compose::join([\\CodegenX\\Compose\\Latte\\Compose::rc('${b.recipe}', ['variant' => $variant, 'size' => $size]), $class]), attrs: $a, children: (string) $icons}`]];
    case "templ": {
      const lo = name[0].toLowerCase() + name.slice(1);
      return [[`templ/src/compose/${kebab(name)}.templ`, `// ${HEAD}

package compose

import (
	"github.com/ui8kit/codegen/generated/templ/ui/button"
	"github.com/ui8kit/codegen/generated/templ/ui/icon"
)

// ${name}Props: Button + Lucide icons (data-ui8kit="${b.ui}").
type ${name}Props struct {
	Variant   string
	Size      string
${ctrl ? "\tControls  string\n" : ""}	AriaLabel string
	button.ButtonProps
}

func ${lo}Inner(p ${name}Props) button.ButtonProps {
	in := p.ButtonProps
	in.Type = "button"
	in.Class = Join(Rc("${b.recipe}", map[string]string{"variant": p.Variant, "size": p.Size}), p.ButtonProps.Class)
	fixed := map[string]string{"data-ui8kit": "${b.ui}", ${Object.entries(b.fixed).map(([k, v]) => `"${k}": "${v}", `).join("")}"aria-label": Or(p.AriaLabel, "${b.label}")}
${ctrl ? "\tif p.Controls != \"\" {\n\t\tfixed[\"aria-controls\"] = p.Controls\n\t}\n" : ""}	in.Attrs = WithAttrs(in.Attrs, fixed)
	return in
}

// ${name} renders the button with its Lucide icons.
templ ${name}(p ${name}Props) {
	@button.Button(${lo}Inner(p)) {
${b.icons.map(([c, i]) => `\t\t@icon.Icon(icon.IconProps{Class: "${c}"}) {\n\t\t\t@templ.Raw(lucide${i[0].toUpperCase()}${i.slice(1)})\n\t\t}`).join("\n")}
	}
}
`]];
    }
  }
  return [];
}

function breadcrumb(rt: string, HEAD: string): [string, string][] {
  const st = (it: string) => ({ js: `(${it}.current ? "${BC.current}" : ${it}.disabled ? "${BC.disabled}" : "${BC.link}")` });
  switch (rt) {
    case "react": return [["react/src/compose/breadcrumb.tsx", `// ${HEAD}
import type { ComponentProps } from "react";
import { Box } from "${K}/react/src/ui/box/box";
import { Link } from "${K}/react/src/ui/link/link";
import { Text } from "${K}/react/src/ui/text/text";
import { cn } from "${K}/react/src/utils";

export type BreadcrumbItem = { label?: string; href?: string; current?: boolean; disabled?: boolean };
export type BreadcrumbProps = Omit<ComponentProps<typeof Box>, "tag" | "children"> & { items?: BreadcrumbItem[]; "aria-label"?: string; className?: string };

/** Breadcrumb: Box nav > ol > li, Link (href, not disabled) or Text span; aria-current="page" on the current item. */
export function Breadcrumb({ items, "aria-label": ariaLabel, className, ...rest }: BreadcrumbProps) {
  return (
    <Box tag="nav" className={cn("${BC.nav}", className)} aria-label={ariaLabel || "Breadcrumb"} {...rest}>
      <Box tag="ol" className="${BC.ol}">
        {(items ?? []).map((it, i) => (
          <Box key={i} tag="li" className="${BC.li}">
            {it.href && !it.disabled
              ? <Link href={it.href} className={cn("${BC.item}", ${st("it").js})} aria-current={it.current ? "page" : undefined}>{it.label}</Link>
              : <Text tag="span" className={cn("${BC.item}", ${st("it").js})} aria-current={it.current ? "page" : undefined}>{it.label}</Text>}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
`]];
    case "svelte": return [["svelte/src/compose/Breadcrumb.svelte", `<!-- ${HEAD} -->
<!-- Breadcrumb: Box nav > ol > li, Link (href, not disabled) or Text span; aria-current="page" on the current item. -->
<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Box from "${K}/svelte/src/ui/box/Box.svelte";
  import Link from "${K}/svelte/src/ui/link/Link.svelte";
  import Text from "${K}/svelte/src/ui/text/Text.svelte";
  import { cn } from "${K}/svelte/src/utils";

  type Item = { label?: string; href?: string; current?: boolean; disabled?: boolean };
  let { items = [], "aria-label": ariaLabel, class: className, ...rest }: Omit<ComponentProps<typeof Box>, "tag" | "children"> & { items?: Item[]; "aria-label"?: string; class?: string } = $props();
</script>

<Box tag="nav" class={cn("${BC.nav}", className)} aria-label={ariaLabel || "Breadcrumb"} {...rest}><Box tag="ol" class="${BC.ol}">{#each items as it, i (i)}<Box tag="li" class="${BC.li}">{#if it.href && !it.disabled}<Link href={it.href} class={cn("${BC.item}", ${st("it").js})} aria-current={it.current ? "page" : undefined}>{it.label}</Link>{:else}<Text tag="span" class={cn("${BC.item}", ${st("it").js})} aria-current={it.current ? "page" : undefined}>{it.label}</Text>{/if}</Box>{/each}</Box></Box>
`]];
    case "vue": return [["vue/src/compose/Breadcrumb.vue", `<!-- ${HEAD} -->
<!-- Breadcrumb: Box nav > ol > li, Link (href, not disabled) or Text span; aria-current="page" on the current item. -->
<script setup lang="ts">
import { computed, useAttrs } from "vue";
import Box from "${K}/vue/src/ui/box/Box.vue";
import Link from "${K}/vue/src/ui/link/Link.vue";
import Text from "${K}/vue/src/ui/text/Text.vue";
import { cn } from "${K}/vue/src/utils";

type Item = { label?: string; href?: string; current?: boolean; disabled?: boolean };
defineOptions({ name: "Breadcrumb", inheritAttrs: false });
const props = defineProps<{ items?: Item[]; ariaLabel?: string }>();
const attrs = useAttrs();
const rest = computed(() => {
  const { class: _class, ...r } = attrs;
  return r;
});
const cls = computed(() => cn("${BC.nav}", attrs.class as string | undefined));
const st = (it: Item) => cn("${BC.item}", ${st("it").js.replace(/"/g, "'")});
</script>

<template>
  <Box tag="nav" :class="cls" :aria-label="props.ariaLabel || 'Breadcrumb'" v-bind="rest"><Box tag="ol" class="${BC.ol}"><Box v-for="(it, i) in props.items ?? []" :key="i" tag="li" class="${BC.li}"><Link v-if="it.href && !it.disabled" :href="it.href" :class="st(it)" :aria-current="it.current ? 'page' : undefined">{{ it.label }}</Link><Text v-else tag="span" :class="st(it)" :aria-current="it.current ? 'page' : undefined">{{ it.label }}</Text></Box></Box></Box>
</template>
`]];
    case "solid": return [["solid/src/compose/breadcrumb.solid.tsx", `// ${HEAD}
import { For, splitProps, type ComponentProps } from "solid-js";
import { Box } from "${K}/solid/src/ui/box/box.solid";
import { Link } from "${K}/solid/src/ui/link/link.solid";
import { Text } from "${K}/solid/src/ui/text/text.solid";
import { cn } from "${K}/solid/src/utils";

export type BreadcrumbItem = { label?: string; href?: string; current?: boolean; disabled?: boolean };
export type BreadcrumbProps = Omit<ComponentProps<typeof Box>, "tag" | "children" | "class" | "className"> & { items?: BreadcrumbItem[]; "aria-label"?: string; class?: string; className?: string };

/** Breadcrumb: Box nav > ol > li, Link (href, not disabled) or Text span; aria-current="page" on the current item. */
export function Breadcrumb(props: BreadcrumbProps) {
  const [local, rest] = splitProps(props, ["items", "aria-label", "class", "className"]);
  return (
    <Box tag="nav" class={cn("${BC.nav}", local.class ?? local.className)} aria-label={local["aria-label"] || "Breadcrumb"} {...rest}>
      <Box tag="ol" class="${BC.ol}">
        <For each={local.items ?? []}>{(it) => (
          <Box tag="li" class="${BC.li}">
            {it.href && !it.disabled
              ? <Link href={it.href} class={cn("${BC.item}", ${st("it").js})} aria-current={it.current ? "page" : undefined}>{it.label}</Link>
              : <Text tag="span" class={cn("${BC.item}", ${st("it").js})} aria-current={it.current ? "page" : undefined}>{it.label}</Text>}
          </Box>
        )}</For>
      </Box>
    </Box>
  );
}
`]];
    case "jinja2": return [["jinja2/src/compose/breadcrumb.html.j2", `{#- ${HEAD}
    Breadcrumb: Box nav > ol > li, Link or Text span. Props (p): Items [{label, href, current, disabled}], AriaLabel, Class, Attrs. -#}
{%- set lis %}{% for it in p['Items'] or [] %}{% set c = compose_join(['${BC.item}', '${BC.current}' if it['current'] else ('${BC.disabled}' if it['disabled'] else '${BC.link}')]) %}{% set a = {'aria-current': 'page'} if it['current'] else {} %}{% set inner %}{% if it['href'] and not it['disabled'] %}{% with p = {'Href': it['href'], 'Class': c, 'Attrs': a}, children = it['label']|e %}{% include 'ui/link/link.html.j2' %}{% endwith %}{% else %}{% with p = {'Tag': 'span', 'Class': c, 'Attrs': a}, children = it['label']|e %}{% include 'ui/text/text.html.j2' %}{% endwith %}{% endif %}{% endset %}{% with p = {'Tag': 'li', 'Class': '${BC.li}'}, children = inner %}{% include 'ui/box/box.html.j2' %}{% endwith %}{% endfor %}{% endset %}
{%- set ol %}{% with p = {'Tag': 'ol', 'Class': '${BC.ol}'}, children = lis %}{% include 'ui/box/box.html.j2' %}{% endwith %}{% endset %}
{%- set a = {'aria-label': p['AriaLabel'] or 'Breadcrumb'} %}{%- set _ = a.update(p['Attrs'] or {}) %}
{%- with p = {'Tag': 'nav', 'Class': compose_join(['${BC.nav}', p['Class']]), 'Attrs': a}, children = ol %}{% include 'ui/box/box.html.j2' %}{% endwith %}`]];
    case "twig": return [["twig/src/compose/Breadcrumb.html.twig", `{# ${HEAD} #}
{# Breadcrumb: Box nav > ol > li, Link or Text span. Params: items [{label, href, current, disabled}], ariaLabel, class, attrs. #}
{% set lis %}{% for it in items|default([]) %}{% set c = '${BC.item} ' ~ (it.current|default(false) ? '${BC.current}' : (it.disabled|default(false) ? '${BC.disabled}' : '${BC.link}')) %}{% set a = it.current|default(false) ? {'aria-current': 'page'} : {} %}{% set inner %}{% if it.href|default('') and not it.disabled|default(false) %}{{ include('ui/link/Link.html.twig', {href: it.href, class: c, attrs: a, children: it.label|default('')|e}, with_context = false)|trim|raw }}{% else %}{{ include('ui/text/Text.html.twig', {tag: 'span', class: c, attrs: a, children: it.label|default('')|e}, with_context = false)|trim|raw }}{% endif %}{% endset %}{{ include('ui/box/Box.html.twig', {tag: 'li', class: '${BC.li}', children: inner}, with_context = false)|trim|raw }}{% endfor %}{% endset %}
{% set ol %}{{ include('ui/box/Box.html.twig', {tag: 'ol', class: '${BC.ol}', children: lis}, with_context = false)|trim|raw }}{% endset %}
{{ include('ui/box/Box.html.twig', {tag: 'nav', class: compose_join(['${BC.nav}', class|default('')]), attrs: {'aria-label': ariaLabel|default('') ?: 'Breadcrumb'}|merge(attrs|default({})), children: ol}, with_context = false)|trim|raw }}`]];
    case "latte": return [["latte/src/compose/Breadcrumb.latte", `{* ${HEAD} *}
{* Breadcrumb: Box nav > ol > li, Link or Text span. Includes inherit variables: shadowed params are passed explicitly. *}
{parameters
  array $items = [],
  string $ariaLabel = '',
  string $class = '',
  array $attrs = [],
}
{capture $lis}{foreach $items as $it}{var $c = '${BC.item} ' . (($it['current'] ?? false) ? '${BC.current}' : (($it['disabled'] ?? false) ? '${BC.disabled}' : '${BC.link}'))}{var $a = ($it['current'] ?? false) ? ['aria-current' => 'page'] : []}{capture $inner}{if ($it['href'] ?? '') !== '' && !($it['disabled'] ?? false)}{include '../ui/link/Link.latte', href: $it['href'], class: $c, ariaLabel: '', attrs: $a, children: htmlspecialchars((string) ($it['label'] ?? ''), ENT_QUOTES)}{else}{include '../ui/text/Text.latte', tag: 'span', class: $c, attrs: $a, children: htmlspecialchars((string) ($it['label'] ?? ''), ENT_QUOTES)}{/if}{/capture}{include '../ui/box/Box.latte', tag: 'li', class: '${BC.li}', attrs: [], children: (string) $inner}{/foreach}{/capture}
{capture $ol}{include '../ui/box/Box.latte', tag: 'ol', class: '${BC.ol}', attrs: [], children: (string) $lis}{/capture}
{include '../ui/box/Box.latte', tag: 'nav', class: \\CodegenX\\Compose\\Latte\\Compose::join(['${BC.nav}', $class]), attrs: ['aria-label' => $ariaLabel !== '' ? $ariaLabel : 'Breadcrumb', ...$attrs], children: (string) $ol}`]];
    case "templ": return [["templ/src/compose/breadcrumb.templ", `// ${HEAD}

package compose

import (
	"github.com/ui8kit/codegen/generated/templ/ui/box"
	"github.com/ui8kit/codegen/generated/templ/ui/link"
	"github.com/ui8kit/codegen/generated/templ/ui/text"
)

// BreadcrumbItem is one step of the trail.
type BreadcrumbItem struct {
	Label    string
	Href     string
	Current  bool
	Disabled bool
}

// BreadcrumbProps: Box nav > ol > li, Link (href, not disabled) or Text span.
type BreadcrumbProps struct {
	Items     []BreadcrumbItem
	AriaLabel string
	box.BoxProps
}

func breadcrumbItemClass(it BreadcrumbItem) string {
	switch {
	case it.Current:
		return "${BC.item} ${BC.current}"
	case it.Disabled:
		return "${BC.item} ${BC.disabled}"
	}
	return "${BC.item} ${BC.link}"
}

func breadcrumbCurrent(it BreadcrumbItem) templ.Attributes {
	if it.Current {
		return templ.Attributes{"aria-current": "page"}
	}
	return templ.Attributes{}
}

func breadcrumbNav(p BreadcrumbProps) box.BoxProps {
	in := p.BoxProps
	in.Tag = "nav"
	in.Class = Join("${BC.nav}", p.BoxProps.Class)
	in.Attrs = WithAttrs(in.Attrs, map[string]string{"aria-label": Or(p.AriaLabel, "Breadcrumb")})
	return in
}

// Breadcrumb renders the trail; aria-current="page" on the current item.
templ Breadcrumb(p BreadcrumbProps) {
	@box.Box(breadcrumbNav(p)) {
		@box.Box(box.BoxProps{Tag: "ol", Class: "${BC.ol}"}) {
			for _, it := range p.Items {
				@box.Box(box.BoxProps{Tag: "li", Class: "${BC.li}"}) {
					if it.Href != "" && !it.Disabled {
						@link.Link(link.LinkProps{Href: it.Href, Class: breadcrumbItemClass(it), Attrs: breadcrumbCurrent(it)}) {
							{ it.Label }
						}
					} else {
						@text.Text(text.TextProps{Tag: "span", Class: breadcrumbItemClass(it), Attrs: breadcrumbCurrent(it)}) {
							{ it.Label }
						}
					}
				}
			}
		}
	}
}
`]];
  }
  return [];
}

export function manualFiles(HEAD: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const rt of ["react", "svelte", "vue", "solid", "jinja2", "twig", "latte", "templ"]) {
    for (const [n, b] of Object.entries(ICON_BUTTONS)) for (const [k, v] of ib(rt, n, b, HEAD)) out.set(k, v);
    for (const [k, v] of breadcrumb(rt, HEAD)) out.set(k, v);
  }
  out.set("templ/src/compose/lucide.go", `// ${HEAD}

package compose

// Lucide icons (lucide.dev), markup shared with every runtime (src/manual.ts).
${Object.entries(LUCIDE).map(([k, v]) => `const lucide${k[0].toUpperCase()}${k.slice(1)} = ${JSON.stringify(v)}`).join("\n")}
`);
  return out;
}
