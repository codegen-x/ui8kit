<!-- Portfolio: a centred header, a short profile, the project grid, a photo gallery and a contact call to action. -->
<script lang="ts">
  import { Block, AboutMe, CtaBand, PhotoGallery, ProjectGrid } from "@ui8kit/svelte-ui";
  import type { Deck } from "@ui8kit/taste-data/copy";
  import { dataFor } from "./registry-data";
  import Header from "./header.svelte";
  import Footer from "./footer.svelte";

  let { c }: { c: Deck } = $props();
  const d = $derived(dataFor(c.brand));
</script>

<Header {c} layout="split" />
<Block tag="main" id="tp-port-main" class="tp-main">
  <AboutMe
    id="tp-port-about"
    title={c.title}
    lead={c.lead}
    badge={c.eyebrow}
    facts={d.facts}
    skills={d.skills}
    labels={d.ui.company.aboutMe}
    actions={{ mode: "two", cta: c.cta, secondary: c.secondary }}
    layout="facts"
    mediaSide="start"
    tone="default"
  />
  <ProjectGrid id="tp-port-projects" title={d.ui.company.projects.title} lead={d.ui.company.projects.lead} projects={d.projects} labels={d.ui.company.projects} layout="bento" tone="default" density="default" />
  <PhotoGallery id="tp-port-photos" title={d.ui.company.photos.title} lead={d.ui.company.photos.lead} photos={d.photos} labels={d.ui.company.photos} layout="masonry" captions="show" tone="muted" density="default" />
  <CtaBand id="tp-port-cta" title={c.accent} text={c.note} actions={{ mode: "one", cta: c.cta }} layout="card" tone="default" proof="none" density="default" />
</Block>
<Footer {c} layout="row" />
