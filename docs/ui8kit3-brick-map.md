# UI8Kit 3: map of the xgen bricks onto the v3 primitives

Source of truth: `packages/kit-compose/src/map.ts` (one description) + `packages/kit-compose/variants/*.variants.json` (token-only recipes moved from the xgen brick specs).
`bun run compose:build` writes one composition per row for each runtime under `packages/kit-compose/<runtime>/src/compose`, on top of the installed kit `packages/kit/<runtime>`.
A composition = one v3 primitive + fixed tag + `cn(recipe classes, extra, caller class)`; no logic, no new primitive.
Compositions are candidates for the shared @ui8kit registry (a brand/compose registry on top of @ui8kit/registry primitives).

Prop placement, checked against ui8kit/codegen v0.1.0: as there, `variant` / `size` are props of Button/Badge, `Tag` selects the element of Stack/Block (fallback div), and the rest (`aria-*`, `data-*`, `href`, `type`, ...) passes through to the element unchanged. Difference: v0.1.0 Stack/Group had no layout props (gap/align via class); codegen-x keeps the xgen recipe keys `gap` / `align` / `justify` as props, because 361 Gap and 243 Align uses in the specs rely on them. Title keeps `as` (heading level 1–6, default h2) from xgen.

| Brick | v3 primitive | Tag | Recipe | Fixed / extra |
| --- | --- | --- | --- | --- |
| Box | Box | from `Tag`, default `div` | box | — |
| Block | Box | from `Tag`, default `div` | block | — |
| Stack | Box | from `Tag`, default `div` | stack | — |
| Group | Box | from `Tag`, default `div` | group | — |
| Grid | Box | from `Tag`, default `div` | grid | — |
| GridCol | Box | `div` | — | — |
| Container | Box | from `Tag`, default `div` | container | — |
| Inline | Text | `span` | inline | — |
| List | Box | from `Tag`, default `ul` | list | — |
| ListItem | Box | `li` | — | — |
| Skeleton | Box | `div` | skeleton | "aria-hidden": "true" |
| Alert | Box | `div` | alert | role: "alert" |
| Card | Box | `div` | card | — |
| CardHeader | Box | `div` | — | `flex flex-col gap-2 p-6` |
| CardTitle | Text | `h3` | — | `text-lg font-semibold text-foreground` |
| CardDescription | Text | `p` | — | `text-sm text-muted-foreground` |
| CardContent | Box | `div` | — | `p-6 pt-0` |
| CardFooter | Box | `div` | — | `flex items-center p-6 pt-0` |
| Table | Box | `table` | table | — |
| TableCaption | Box | `caption` | — | — |
| TableHead | Box | `thead` | — | — |
| TableBody | Box | `tbody` | — | — |
| TableFoot | Box | `tfoot` | — | — |
| TableRow | Box | `tr` | — | — |
| TableHeadCell | Box | `th` | table-head-cell | — |
| TableCell | Box | `td` | table-cell | — |
| TableColGroup | Box | `colgroup` | — | — |
| TableCol | Box | `col` | — | — |
| Fieldset | Box | `fieldset` | fieldset | — |
| Legend | Text | `legend` | legend | — |
| FormItem | Box | `div` | form-item | — |
| FormDescription | Text | `p` | form-description | — |
| FormMessage | Text | `p` | form-message | — |
| Text | Text | from `Tag`, default `p` | text | — |
| Title | Text | from `As` (h1–h6), default `h2` | title | — |
| Badge | Text | `span` | badge | — |
| IconBadge | Text | `span` | iconbadge | — |
| LucideIcon | Icon | — | lucide-icon | — |
| Icon | Icon | — | icon | — |
| Button | Button | — | button | — |
| ButtonPlain | Button | — | button-plain | — |
| Link | Link | — | link | — |
| LinkPlain | Link | — | link-plain | — |
| Label | Label | — | label | — |
| Form | Form | — | form | — |
| Input | Input | — | input | — |
| Range | Input | — | range | type: "range" |
| Textarea | Textarea | — | textarea | — |
| Select | Select | — | select | — |
| SelectOption | SelectOption | — | — | — |
| OptGroup | SelectOptGroup | — | — | — |
| Checkbox | Checkbox | — | checkbox | — |
| Radio | Radio | — | radio | — |
| Switch | Switch | — | switch | — |
| Image | Image | — | image | — |
| Separator | Separator | — | separator | — |
| Dialog | Dialog | — | dialog | — |
| Sheet | Dialog | — | sheet | — |
| Disclosure | Disclosure | — | disclosure | — |
| Summary | Summary | — | summary | — |
| Meter | Meter | — | meter | — |
| Progress | Progress | — | progress | — |

Hand-written (`src/manual.ts`, all 8 runtimes, in both parity suites): Breadcrumb (Box nav[aria-label] > ol > li, Link or Text span, aria-current=page; labels escaped), ThemeToggle (Button + Icon with Lucide sun/moon, aria-pressed), SheetTrigger/SheetClose (Button + Icon with Lucide menu/x, aria-expanded, aria-haspopup=dialog, aria-controls). Not lowered yet: Break (`<br>` has no primitive: allowlisted raw tag), DataList/DataOption/Output (no primitive: allowlisted), Picture/Source (v3 Image module).

Recipe changes against xgen: `text-white` on destructive Button/Badge/IconBadge -> `text-primary-foreground` (colors only by tokens; there is no destructive-foreground token in theme.css yet: contrast to be reviewed).
Runtimes built now: react, svelte, vue, solid (DOM parity of all four, html-validate + axe on every case, typecheck: tsc, vue-tsc, svelte-check; 8 + 4 with the controls exception) and the servers jinja2, twig, latte, templ (real engines: DOM = React on the same cases, `test/server.test.tsx`).

Server compositions (one template per composition, no logic; props by one helper per language from `<runtime>/src/compose/compose.json`):

| runtime | templates | helper | wiring |
| --- | --- | --- | --- |
| jinja2 | `jinja2/src/compose/<kebab>.html.j2`, `render(p={...}, children=Markup(...))` | `compose_env.py`: `environment(kit_root)` = the kit environment + `compose/` + `compose_props` | `sys.path`: the kit `src` and `jinja2/src/compose` |
| twig | `twig/src/compose/<Name>.html.twig` | `ComposeExtension` (`compose_props`) | `FilesystemLoader([kit/twig/src, kit-compose/twig/src])` + the kit `TwigExtension` |
| latte | `latte/src/compose/<Name>.latte` (typed `{parameters}` copied from the primitive) | `Compose::props` | one loader root with `ui/` (kit) and `compose/` side by side |
| templ | `templ/src/compose/<kebab>.templ`, `compose.StackProps{Gap: "4", BoxProps: box.BoxProps{...}}` | `compose.go` (`Rc`, `Join`, `Heading`) | `templ/go.mod` + `templ/kitmod` (go.mod of the installed kit, `ui/` `utils/` symlinks) |

Props on the servers: recipe keys (`variant`, `size`, ...; PascalCase in Jinja2 `p` and templ), `tag` / `as`, `class`, `attrs` (aria-*, data-*), plus every prop of the primitive. Known kit bug seen through Image `variant=logo` (registry 3.2.0 server cn merge lacks object-fit): asserted in `KNOWN_KIT_BUGS`, fixed in registry 3.2.2 (unpublished).
