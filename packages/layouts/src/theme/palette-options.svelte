<!-- The Options card of the palette panel, under the wheel (left column): a home for the palette's finer options. First: the primary
     (the palette's base colour) as one text field in the skins' token format `H S% L%`. Typing or pasting HSL applies it as you go;
     a Hex colour (#rgb, #rrggbb, the # optional) turns into HSL and applies; anything else shows an error under the field and
     changes nothing. Moving the wheel or the ranges rewrites the field (it shows the palette's colour whenever it is not being typed
     in). Conversion: @ui8kit/theme-model/colour-input. -->
<script lang="ts">
  import { Box, Card, FormDescription, FormMessage, Input, Label, Text } from "@codegen-x/svelte-compose";
  import { formatHsl, parseColour } from "@ui8kit/theme-model/colour-input";
  import type { Palette } from "@ui8kit/theme-model/palette";
  import type { PaletteText } from "./text";

  let { palette, onchange, text }: { palette: Palette; onchange: (p: Palette) => void; text: PaletteText["options"] } = $props();
  const id = "ui8-palette-primary";
  // draft: what is being typed (null: the field shows the palette's colour); bad: the draft is not a colour
  let draft = $state<string | null>(null);
  let bad = $state(false);
  const shown = $derived(draft ?? formatHsl(palette));

  function input(e: Event): void {
    const v = (e.currentTarget as HTMLInputElement).value;
    const c = parseColour(v);
    bad = !c && v.trim() !== "";
    if (!c) { draft = v; return; }
    // HSL keeps the typing as it is; Hex is replaced by its HSL at once
    draft = c.from === "hsl" ? v : null;
    onchange({ ...palette, ...c.hsl });
  }
  // leaving the field: a valid draft settles into the token format, an invalid one stays with its error
  const settle = (): void => { if (!bad) draft = null; };
</script>

<Card class="ui8-palette-options" data-testid="palette-options">
  <Text tag="span" weight="semibold" class="ui8-palette-label">{text.title}</Text>
  <Box class="ui8-palette-option">
    <Label for={id} class="ui8-palette-label">{text.primary}</Label>
    <Box class="ui8-palette-primary-row">
      <Box class="ui8-palette-swatch" style={`background:hsl(${formatHsl(palette)})`} aria-hidden="true"></Box>
      <Input {id} value={shown} oninput={input} onblur={settle} spellcheck="false" autocomplete="off" aria-describedby={id + "-hint " + id + "-error"} data-testid="palette-primary-input" />
    </Box>
    <FormDescription id={id + "-hint"} class="ui8-palette-muted">{text.hint}</FormDescription>
    <FormMessage id={id + "-error"} class="ui8-palette-error" data-testid="palette-primary-error">{bad ? text.error : ""}</FormMessage>
  </Box>
</Card>
