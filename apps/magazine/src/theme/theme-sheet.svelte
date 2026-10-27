<!-- The global Theme sheet of the Magazine: the shared sheet of @ui8kit/layouts/theme (narrow Theme panel + wide Design system
     panel) with the Magazine's controller (lib/global-theme.svelte.ts) and texts (content/ui.json). -->
<script lang="ts">
  import ThemeSheet from "@ui8kit/layouts/theme/theme-sheet.svelte";
  import ui from "../../content/ui.json";
  import { themeCtl } from "../lib/global-theme.svelte";

  // the values the site shows where the theme sets nothing: the app skin and font, radius 8
  const FALLBACK = { skin: "sky", font: "inter", radius: 8 } as const;
</script>

<ThemeSheet ctl={themeCtl} text={ui} id="mg-theme-sheet" titleId="mg-theme-title" fallback={FALLBACK} />
