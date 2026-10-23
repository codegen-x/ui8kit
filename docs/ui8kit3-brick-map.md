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

Not lowered yet (hand-written compositions to build): Breadcrumb (Box nav + list + Link + Text aria-current), ThemeToggle (Button + Icon, aria-pressed), SheetTrigger/SheetClose (Button + Icon controlling Dialog), Break (`<br>` has no primitive: allowlisted raw tag), DataList/DataOption/Output (no primitive: allowlisted), Picture/Source (v3 Image module).

Recipe changes against xgen: `text-white` on destructive Button/Badge/IconBadge -> `text-primary-foreground` (colors only by tokens; there is no destructive-foreground token in theme.css yet: contrast to be reviewed).
Runtimes built now: react, svelte (DOM parity + html-validate + axe in `packages/kit-compose/test`). Next: vue, solid, templ, twig, latte, jinja2.
