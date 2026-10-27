<!-- The specimen of the Design system: colour tokens, type scale, radii, spacing, buttons, badges, card, alerts and inputs in one
     live frame whose skin, single font, radius and per-element tokens are CSS variables. Shared by the Theme sheet's Design system
     panel and the Magazine's style page. -->
<script lang="ts">
  import { Alert, Badge, Box, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Group, Input, Label, Text, Title } from "@codegen-x/svelte-compose";
  import { family, type FontId } from "@ui8kit/taste-data/fonts";
  import { RADII } from "@ui8kit/taste-data/taste";
  import { tokenAttrs, tokenStyle, type Tokens } from "@ui8kit/theme-model/design";
  import type { Token } from "@ui8kit/theme-model/tokens";
  import type { DesignText } from "./text";

  let { text, modes, skin, font, radius, tokens, tokenValues, idp = "ds", class: className = "" }: {
    text: DesignText; /** the names of the two modes */ modes: { light: string; dark: string };
    skin: string; font: FontId; radius: number; tokens: { light: Token[]; dark: Token[] }; tokenValues: Tokens;
    /** id prefix: unique per use on a page */ idp?: string; class?: string;
  } = $props();
  const style = $derived(`--radius:${radius}px;--font-sans:${family(font)},sans-serif;--taste-heading:${family(font)},sans-serif;${tokenStyle(tokenValues)}`);
  const attrs = $derived(tokenAttrs(tokenValues));
  const PX = "px";
  const CHIP = "4px";
  const DOT = " · ";
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
  const H = "m-0 leading-6";
  const LABEL = "text-xs leading-4 text-muted-foreground";
  const ROW = "flex flex-wrap items-center gap-4";
  const DANGER = "bg-card! text-foreground! shadow-[inset_0_0_0_2px_var(--destructive)]!";
</script>

<Box class={"w-full max-w-300 overflow-hidden rounded border border-border " + className} data-testid="ds-specimen">
  <Box class="flex flex-col gap-8 bg-background p-8 font-sans text-foreground [&_:is(h1,h2,h3,h4,h5,h6)]:font-[family-name:var(--taste-heading,var(--font-sans))]" data-skin={skin} {style} {...attrs}>
    <Box class="flex flex-col gap-4">
      <Title as={3} size="base" class={H}>{text.tokens}</Title>
      {#each ([{ mode: "light", list: tokens.light }, { mode: "dark", list: tokens.dark }]) as { mode, list } (mode)}
        <Box class="flex flex-wrap items-center gap-x-4 gap-y-2" data-mode={mode}>
          <Text tag="span" class={"w-12 " + LABEL}>{mode === "light" ? modes.light : modes.dark}</Text>
          {#each list as t (t.name)}
            <Text tag="span" class="inline-flex items-center gap-2 text-xs leading-normal" title={`--${t.name}: ${t.value}`}><Text tag="span" style={`background:${t.css};border-radius:${CHIP}`} class="inline-block h-6 w-6 border border-border"></Text><Text tag="span">{t.name}</Text><Text tag="code" class="text-xs leading-normal text-muted-foreground">{t.value}</Text></Text>
          {/each}
        </Box>
      {/each}
    </Box>

    <Box class="flex flex-col gap-4">
      <Title as={3} size="base" class={H}>{text.type}</Title>
      {#each SCALE as r (r.name)}
        <Box class="grid grid-cols-[10rem_minmax(0,1fr)] items-baseline gap-4"><Text tag="span" class={LABEL}>{r.name + DOT + r.size + "/" + r.line}</Text><Text tag="span" style={`font-size:${`${r.size}px`};line-height:${`${r.line}px`};font-weight:${r.weight}`}>{text.sample}</Text></Box>
      {/each}
    </Box>

    <Box class="grid grid-cols-2 items-start gap-8">
      <Box>
        <Title as={3} size="base" class={H}>{text.radii}</Title>
        <Box class={ROW}>
          {#each RADII as r (r)}
            <Text tag="span" class="inline-flex flex-col gap-2"><Text tag="span" style={`border-radius:${`${r}px`}`} class={"inline-block h-12 w-16 border " + (r === radius ? "border-(--primary) bg-(--primary)" : "border-border bg-muted")}></Text><Text tag="span" class={LABEL}>{r + PX}{r === radius ? DOT + text.current : ""}</Text></Text>
          {/each}
        </Box>
      </Box>
      <Box>
        <Title as={3} size="base" class={H}>{text.spacing}</Title>
        <Group gap="4" align="end" justify="start" class="flex-wrap">
          {#each SPACING as n (n)}<Text tag="span" class="inline-flex flex-col gap-2"><Text tag="span" style={`width:${`${n}px`}`} class="inline-block h-4 bg-(--primary)"></Text><Text tag="span" class={LABEL}>{n}</Text></Text>{/each}
        </Group>
      </Box>
    </Box>

    <Box class="flex flex-col gap-4">
      <Title as={3} size="base" class={H}>{text.buttons}</Title>
      <Box class={ROW}>
        <Button>{text.primary}</Button>
        <Button variant="secondary">{text.secondary}</Button>
        <Button variant="outline">{text.outline}</Button>
        <Button variant="ghost">{text.ghost}</Button>
        <Button variant="destructive" class={DANGER}>{text.destructive}</Button>
        <Button size="sm">{text.small}</Button>
        <Button size="lg">{text.large}</Button>
        <Button disabled>{text.disabled}</Button>
      </Box>
      <Title as={3} size="base" class={H}>{text.badges}</Title>
      <Box class={ROW}>
        <Badge>{text.primary}</Badge><Badge variant="secondary">{text.secondary}</Badge><Badge variant="outline">{text.outline}</Badge><Badge variant="destructive" class={DANGER}>{text.destructive}</Badge>
      </Box>
    </Box>

    <Box class="grid grid-cols-2 items-start gap-8">
      <Card>
        <CardHeader><CardTitle>{text.cardTitle}</CardTitle><CardDescription>{text.cardText}</CardDescription></CardHeader>
        <CardContent><Box class={ROW}><Button size="sm">{text.primary}</Button><Button size="sm" variant="outline">{text.outline}</Button></Box></CardContent>
      </Card>
      <Box class="flex flex-col gap-2">
        <Alert>{text.alertInfo}</Alert>
        <Alert variant="success">{text.alertOk}</Alert>
        <Alert variant="warning">{text.alertWarn}</Alert>
        <Alert variant="destructive" role="alert" class={DANGER}>{text.alertError}</Alert>
      </Box>
    </Box>

    <Box class="flex flex-col gap-4">
      <Title as={3} size="base" class={H}>{text.inputs}</Title>
      <Box class="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-4">
        <Box class="flex flex-col gap-2"><Label for={idp + "-name"}>{text.fieldName}</Label><Input id={idp + "-name"} placeholder={text.placeholder} /></Box>
        <Box class="flex flex-col gap-2"><Label for={idp + "-mail"}>{text.fieldMail}</Label><Input id={idp + "-mail"} type="email" placeholder={text.mailPlaceholder} /></Box>
        <Box class="flex flex-col gap-2"><Label for={idp + "-off"}>{text.fieldOff}</Label><Input id={idp + "-off"} disabled placeholder={text.disabled} /></Box>
      </Box>
    </Box>
  </Box>
</Box>
