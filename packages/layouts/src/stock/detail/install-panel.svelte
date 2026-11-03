<!-- How to get the code of the asset: a runtime select, the `npx ui8kit add` command of that runtime in a code block with a copy
     button, and the showcase page of each registry block on the docs site (opens in a new tab). A block variant has one block; a
     screen page lists its blocks and one command that adds them all. Data from the app (DetailView.install), texts via props. -->
<script lang="ts">
  import { Block, Box, Button, Group, Label, Link, List, ListItem, LucideIcon, Select, SelectOption, Stack, Text, Title } from "@codegen-x/svelte-compose";
  import { fmt, type InstallView, type StockText } from "../text";

  let { t, install, screen }: { t: StockText; install: InstallView; screen: boolean } = $props();
  let runtime = $state("");
  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const current = $derived(install.commands.find((c) => c.id === runtime) ?? install.commands[0]);
  async function copy(): Promise<void> {
    if (!current) return;
    try { await navigator.clipboard.writeText(current.command); } catch { return; }
    copied = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 2000);
  }
</script>

<Block tag="section" aria-labelledby="detail-install-title" class="ui8-install" data-testid="detail-install">
  <Stack gap="4" align="stretch">
    <Title as={2} size="sm" weight="semibold" id="detail-install-title" class="ui8-summary-heading">{t.detail.install.title}</Title>
    <Group gap="2" align="center" class="ui8-install-runtime">
      <Label for="detail-install-runtime" class="ui8-install-label">{t.detail.install.runtime}</Label>
      <Select id="detail-install-runtime" size="sm" class="ui8-install-select" value={current?.id ?? ""} onchange={(e: Event) => { runtime = (e.currentTarget as HTMLSelectElement).value; copied = false; }} data-testid="detail-install-select">
        {#each install.commands as c (c.id)}<SelectOption value={c.id}>{c.label}</SelectOption>{/each}
      </Select>
    </Group>
    {#if current}
      <Group gap="2" align="start" class="ui8-install-command">
        <Text tag="pre" size="sm" class="ui8-install-code" aria-label={t.detail.install.command}><Text tag="code" data-testid="detail-install-command">{current.command}</Text></Text>
        <Button size="sm" variant="outline" class="ui8-install-copy" onclick={copy} aria-label={copied ? t.detail.install.copied : t.detail.install.copy} data-testid="detail-install-copy">
          <LucideIcon name={copied ? "check" : "copy"} size={16} />
        </Button>
      </Group>
      <Text tag="span" class="ui8-install-sr" aria-live="polite">{copied ? t.detail.install.copied : ""}</Text>
    {/if}
    {#if screen}
      <Text tag="p" size="sm" class="ui8-summary-muted">{fmt(t.detail.install.blocks, { n: install.items.length })}</Text>
      <List tag="ul" class="ui8-install-items" data-testid="detail-install-items">
        {#each install.items as it (it.name)}
          <ListItem>
            <Link href={it.href} target="_blank" rel="noopener" size="sm" class="ui8-install-link" aria-label={fmt(t.detail.install.docsOf, { name: it.name })}>
              <LucideIcon name="external-link" size={16} />
              <Text tag="span">{it.name}</Text>
            </Link>
          </ListItem>
        {/each}
      </List>
    {:else if install.items[0]}
      <Box>
        <Link href={install.items[0].href} target="_blank" rel="noopener" size="sm" class="ui8-install-link" data-testid="detail-install-docs">
          <LucideIcon name="external-link" size={16} />
          <Text tag="span">{t.detail.install.docs}</Text>
          <Text tag="span" class="ui8-install-sr">{t.detail.install.newTab}</Text>
        </Link>
      </Box>
    {/if}
  </Stack>
</Block>
