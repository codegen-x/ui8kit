<!-- The taste bar: the profile the feed is built from (derived from the picks, or tuned), the Filters button and Reset; the bar is
     @ui8kit/layouts/magazine/taste-bar. -->
<script lang="ts">
  import TasteBar from "@ui8kit/layouts/magazine/taste-bar.svelte";
  import ui from "../../content/ui.json";
  import { isDerived, type Tune } from "../lib/feed";
  import { resetTune, tuning } from "../lib/tune.svelte";
  import { axisLine } from "./labels";

  const AXES: Array<keyof Tune> = ["comp", "character", "density", "skins", "font", "radius", "task", "media"];
  const tune = $derived(tuning.tune!);
  const tuned = $derived(!isDerived(tune, tuning.base!));
  const items = $derived(AXES.map((axis) => ({ id: axis, label: ui.feed.axes[axis], value: axisLine(tune, axis) })));
</script>

<TasteBar title={ui.feed.profile} {tuned} tunedLabel={ui.feed.tuned} filtersLabel={ui.feed.filters} resetLabel={ui.feed.reset} {items} onfilters={() => (tuning.sheet = true)} onreset={resetTune} />
