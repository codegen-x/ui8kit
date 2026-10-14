<!-- The specimen of the Design system: colour tokens, type scale, radii, spacing, buttons, badges, card, alerts and inputs in one
     live frame whose skin, single font, radius and per-element tokens are CSS variables. Shared by the style page and the Theme sheet. -->
<script lang="ts">
  import { Alert, Badge, Box, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Text, Title } from "@ui8kit/svelte-ui";
  import { family, type FontId } from "@ui8kit/taste-data/fonts";
  import { RADII } from "@ui8kit/taste-data/taste";
  import ui from "../../content/ui.json";
  import { tokenAttrs, tokenStyle, type Tokens } from "../lib/design";
  import type { Token } from "../lib/tokens";

  let { skin, font, radius, tokens, tokenValues, idp = "ds" }: { skin: string; font: FontId; radius: number; tokens: { light: Token[]; dark: Token[] }; tokenValues: Tokens; /** id prefix: unique per use on a page */ idp?: string } = $props();
  const style = $derived(`--radius:${radius}px;--font-sans:${family(font)},sans-serif;--taste-heading:${family(font)},sans-serif;${tokenStyle(tokenValues)}`);
  const attrs = $derived(tokenAttrs(tokenValues));
  const PX = "px";
  // the type scale: sizes in px, line heights on the 8px grid
  const SCALE = [
    { name: "Display", size: 48, line: 56, weight: 700 },
    { name: "Heading 1", size: 32, line: 40, weight: 700 },
    { name: "Heading 2", size: 24, line: 32, weight: 600 },
    { name: "Heading 3", size: 20, line: 24, weight: 600 },
    { name: "Body", size: 16, line: 24, weight: 400 },
    { name: "Small", size: 14, line: 24, weight: 400 },
    { name: "Caption", size: 12, line: 16, weight: 400 },
  ];
  const SPACING = [8, 16, 24, 32, 48, 64];
</script>

<Box class="ds-box" data-testid="ds-specimen">
  <Box class="ds-frame" data-skin={skin} {style} {...attrs}>
    <Box class="ds-block">
      <Title as={3} class="ds-h">{ui.design.tokens}</Title>
      {#each ([{ mode: "light", list: tokens.light }, { mode: "dark", list: tokens.dark }]) as { mode, list } (mode)}
        <Box class="ds-swatches" data-mode={mode}>
          <Text tag="span" class="ds-label">{mode === "light" ? ui.style.light : ui.style.dark}</Text>
          {#each list as t (t.name)}
            <Text tag="span" class="ds-swatch" title={`--${t.name}: ${t.value}`}><Text tag="span" style={`background:${t.css}`} class="ds-chip"></Text><Text tag="span">{t.name}</Text><Text tag="code">{t.value}</Text></Text>
          {/each}
        </Box>
      {/each}
    </Box>

    <Box class="ds-block">
      <Title as={3} class="ds-h">{ui.design.type}</Title>
      {#each SCALE as r (r.name)}
        <Box class="ds-type"><Text tag="span" class="ds-label">{r.name} · {r.size}/{r.line}</Text><Text tag="span" style={`font-size:${`${r.size}px`};line-height:${`${r.line}px`};font-weight:${r.weight}`}>{ui.design.sample}</Text></Box>
      {/each}
    </Box>

    <Box class="ds-block ds-two">
      <Box>
        <Title as={3} class="ds-h">{ui.design.radii}</Title>
        <Box class="ds-row">
          {#each RADII as r (r)}
            <Text tag="span" class="ds-radius"><Text tag="span" style={`border-radius:${`${r}px`}`} class={r === radius ? "ds-radius-box ds-on" : "ds-radius-box"}></Text><Text tag="span" class="ds-label">{r + PX}{r === radius ? " · " + ui.design.current : ""}</Text></Text>
          {/each}
        </Box>
      </Box>
      <Box>
        <Title as={3} class="ds-h">{ui.design.spacing}</Title>
        <Box class="ds-row ds-bars">
          {#each SPACING as n (n)}<Text tag="span" class="ds-space"><Text tag="span" style={`width:${`${n}px`}`} class="ds-bar"></Text><Text tag="span" class="ds-label">{n}</Text></Text>{/each}
        </Box>
      </Box>
    </Box>

    <Box class="ds-block">
      <Title as={3} class="ds-h">{ui.design.buttons}</Title>
      <Box class="ds-row">
        <Button>{ui.design.primary}</Button>
        <Button variant="secondary">{ui.design.secondary}</Button>
        <Button variant="outline">{ui.design.outline}</Button>
        <Button variant="ghost">{ui.design.ghost}</Button>
        <Button variant="destructive" class="ds-danger">{ui.design.destructive}</Button>
        <Button size="sm">{ui.design.small}</Button>
        <Button size="lg">{ui.design.large}</Button>
        <Button disabled>{ui.design.disabled}</Button>
      </Box>
      <Title as={3} class="ds-h">{ui.design.badges}</Title>
      <Box class="ds-row">
        <Badge>{ui.design.primary}</Badge><Badge variant="secondary">{ui.design.secondary}</Badge><Badge variant="outline">{ui.design.outline}</Badge><Badge variant="destructive" class="ds-danger">{ui.design.destructive}</Badge>
      </Box>
    </Box>

    <Box class="ds-block ds-two">
      <Card>
        <CardHeader><CardTitle>{ui.design.cardTitle}</CardTitle><CardDescription>{ui.design.cardText}</CardDescription></CardHeader>
        <CardContent><Box class="ds-row"><Button size="sm">{ui.design.primary}</Button><Button size="sm" variant="outline">{ui.design.outline}</Button></Box></CardContent>
      </Card>
      <Box class="ds-stack">
        <Alert>{ui.design.alertInfo}</Alert>
        <Alert variant="success">{ui.design.alertOk}</Alert>
        <Alert variant="warning">{ui.design.alertWarn}</Alert>
        <Alert variant="destructive" role="alert" class="ds-danger">{ui.design.alertError}</Alert>
      </Box>
    </Box>

    <Box class="ds-block">
      <Title as={3} class="ds-h">{ui.design.inputs}</Title>
      <Box class="ds-form">
        <Box class="ds-field"><Label for={idp + "-name"}>{ui.design.fieldName}</Label><Input id={idp + "-name"} placeholder={ui.design.placeholder} /></Box>
        <Box class="ds-field"><Label for={idp + "-mail"}>{ui.design.fieldMail}</Label><Input id={idp + "-mail"} type="email" placeholder={ui.design.mailPlaceholder} /></Box>
        <Box class="ds-field"><Label for={idp + "-off"}>{ui.design.fieldOff}</Label><Input id={idp + "-off"} disabled placeholder={ui.design.disabled} /></Box>
      </Box>
    </Box>
  </Box>
</Box>
