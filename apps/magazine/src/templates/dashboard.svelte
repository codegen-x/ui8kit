<!-- Dashboard: the kit's application shell (navigation rail, search, metrics, chart and activity) as one signed-in screen. -->
<script lang="ts">
  import { AppShell } from "@codegen-x/svelte-compose";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { dataFor } from "./registry-data";

  let { c }: { c: Deck } = $props();
  const d = $derived(dataFor(c.brand));
</script>

<AppShell
  id="tp-dash-shell"
  title={c.title}
  nav={{ label: d.ui.vibe.sidebar.label, brand: c.brand, links: d.sidenav, current: "item-overview" }}
  user={{ name: d.ui.vibe.sidebar.userName, email: d.ui.vibe.sidebar.userEmail }}
  search={{ label: d.ui.vibe.nav.search, shortcut: d.ui.vibe.nav.shortcut }}
  metrics={d.metrics}
  chart={{ title: d.ui.dashboard.chart.title, text: d.ui.dashboard.chart.text, summary: d.ui.dashboard.chart.summary, series: d.series }}
  activity={{ title: d.ui.dashboard.activity.title, text: d.ui.dashboard.activity.text, events: d.activity }}
  layout="sidebar"
  density="default"
/>
