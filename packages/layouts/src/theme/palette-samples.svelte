<!-- The three live cards over the colour wheel: a plan card, the actions and a chart, and the alert and surfaces. Kit compositions
     on the skin's tokens only, so they show the palette as the site will (they sit inside the root that carries it). -->
<script lang="ts">
  import { Alert, Badge, Box, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Group, Text } from "@codegen-x/svelte-compose";
  import type { PaletteText } from "./text";

  let { text }: { text: PaletteText["samples"] } = $props();
  const BARS = ["ui8-palette-bar ui8-palette-bar-1", "ui8-palette-bar ui8-palette-bar-2", "ui8-palette-bar ui8-palette-bar-3", "ui8-palette-bar ui8-palette-bar-4", "ui8-palette-bar ui8-palette-bar-5"];
</script>

<Box class="ui8-palette-samples" data-testid="palette-samples">
  <Card>
    <CardHeader>
      <Group gap="2" justify="between" align="center"><CardTitle>{text.plan}</CardTitle><Badge>{text.popular}</Badge></Group>
      <CardDescription>{text.feature}</CardDescription>
    </CardHeader>
    <CardContent>
      <Group gap="2" align="end" class="ui8-palette-price"><Text tag="span" weight="semibold" class="ui8-palette-price-value">{text.price}</Text><Text tag="span" class="ui8-palette-muted">{text.per}</Text></Group>
      <Button class="ui8-palette-cta">{text.choose}</Button>
    </CardContent>
  </Card>
  <Card>
    <CardHeader><CardTitle>{text.actions}</CardTitle></CardHeader>
    <CardContent>
      <Group gap="2" class="ui8-palette-row"><Button size="sm">{text.primary}</Button><Button size="sm" variant="secondary">{text.secondary}</Button><Button size="sm" variant="outline">{text.outline}</Button></Group>
      <Group gap="2" class="ui8-palette-row"><Badge>{text.primary}</Badge><Badge variant="secondary">{text.secondary}</Badge><Badge variant="outline">{text.outline}</Badge></Group>
      <Box class="ui8-palette-chart" aria-label={text.chart} role="img">{#each BARS as _, i (i)}<Box class={BARS[i]}></Box>{/each}</Box>
    </CardContent>
  </Card>
  <Card>
    <CardHeader><CardTitle>{text.alertTitle}</CardTitle></CardHeader>
    <CardContent>
      <Alert>{text.alertText}</Alert>
      <Box class="ui8-palette-accent">{text.accent}</Box>
      <Box class="ui8-palette-secondary">{text.muted}</Box>
    </CardContent>
  </Card>
</Box>
