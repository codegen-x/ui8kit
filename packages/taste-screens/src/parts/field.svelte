<!-- A form-field look-alike for the search cards and bars of the screens: a small label over a value and an icon. -->
<script lang="ts">
  import { Box, LucideIcon, Stack, Text } from "@codegen-x/svelte-compose";

  let { label, value, icon = "chevron-down", tone = "light" }: { label: string; value: string; icon?: string; tone?: "light" | "glass" } = $props();
</script>

<Box class={"flex items-center justify-between gap-4 rounded px-4 py-2 inset-ring " + (tone === "glass" ? "bg-foreground/80 text-background inset-ring-background/30" : "bg-card text-card-foreground inset-ring-border")}>
  <Stack gap="0">
    <Text size="xs" class={tone === "glass" ? "text-background/80" : "text-muted-foreground"}>{label}</Text>
    <Text size="sm" weight="medium">{value}</Text>
  </Stack>
  <LucideIcon name={icon} size={16} />
</Box>
