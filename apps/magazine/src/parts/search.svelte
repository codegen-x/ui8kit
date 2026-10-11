<!--
  #/search: browse the whole warehouse (every style on the Discovery wall plus the included ones) with a text query and multi-select filters.
  The state is the URL (`#/search?q=…&skin=…`, replaceState while typing, so Back leaves the page and shares stay exact); the last search is
  also kept in sessionStorage for the Back button only. Facet counts follow the other active filters (taste-data/search). Results reuse the
  snapshot-first card; they are shown in chunks of 48 as you scroll (a "Show more" button for the keyboard), live previews stay <= 36.
-->
<script lang="ts">
  import { onMount, tick, untrack } from "svelte";
  import ui from "../../content/ui.json";
  import type { StyleKey } from "@ui8kit/taste-data/picks";
  import { activeCount, emptySearch, FACETS, FACET_VALUES, parseSearch, previewTheme, runSearch, searchHash, similarityScores, SORTS, type Facet, type SearchState, type Sort } from "@ui8kit/taste-data/search";
  import { corpus } from "../lib/corpus";
  import { collectionOf, DEFAULT_ID } from "../lib/collections.svelte";
  import Card from "./card.svelte";

  let { hash, picks }: { hash: string; picks: StyleKey[] } = $props();

  const LAST = "magazine:v1:search-last";
  const CHUNK = 48;
  const t = ui.find;
  const items = corpus();
  const similar = $derived(similarityScores(items, picks));

  let s = $state<SearchState>(untrack(() => parseSearch(hash)));
  let lastHash = untrack(() => hash);
  let shown = $state(CHUNK);
  let open = $state(true);
  let sentinel: HTMLElement | undefined = $state();

  const heartedSet = $derived(new Set(collectionOf(DEFAULT_ID)?.styles ?? []));
  const timed = $derived.by(() => {
    const t0 = performance.now();
    const r = runSearch(items, s, { hearted: heartedSet, similar });
    return { r, ms: Math.round((performance.now() - t0) * 10) / 10 };
  });
  const out = $derived(timed.r);
  const ms = $derived(timed.ms);
  const visible = $derived(out.results.slice(0, shown));
  const dark = $derived(((p) => (p === null ? undefined : p === "dark"))(previewTheme(s)));
  const active = $derived(activeCount(s));

  /** write the state into the address bar (no new history entry) and the session */
  function commit(next: SearchState): void {
    s = next;
    shown = CHUNK;
    const h = searchHash(next);
    lastHash = h;
    if (location.hash !== h) history.replaceState(null, "", location.pathname + location.search + h);
    save(false);
  }
  function save(back: boolean): void {
    try { sessionStorage.setItem(LAST, JSON.stringify({ hash: searchHash(s), y: window.scrollY, back })); } catch { /* storage blocked */ }
  }
  // the address changed from outside (Back, the header link, a pasted URL): read it again
  $effect(() => {
    if (hash === lastHash) return;
    lastHash = hash;
    s = parseSearch(hash);
    shown = CHUNK;
  });

  function toggle(f: Facet, v: string | number): void {
    const cur = s[f] as (string | number)[];
    commit({ ...s, [f]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] } as SearchState);
  }
  const toggleTheme = (v: "light" | "dark") => commit({ ...s, theme: s.theme.includes(v) ? s.theme.filter((x) => x !== v) : [...s.theme, v] });
  const clear = () => commit({ ...emptySearch(), sort: s.sort });
  const label = (f: Facet, v: string | number): string =>
    f === "radius" ? t.radiusLabel.replace("{n}", String(v))
    : f === "layout" ? (t.layouts as Record<string, string>)[v as string] ?? String(v)
    : f === "pattern" ? (ui.style.patterns as Record<string, string>)[v as string] ?? String(v)
    : String(v);
  const countText = $derived((out.results.length === 1 ? t.countOne : t.count).replace("{n}", String(out.results.length)).replace("{total}", String(out.total)));
  const chips = $derived([
    ...(s.q ? [{ id: "q", text: `${t.q}: ${s.q}`, off: () => commit({ ...s, q: "" }) }] : []),
    ...FACETS.flatMap((f) => (s[f] as (string | number)[]).map((v) => ({ id: f + ":" + v, text: `${(t.facets as Record<string, string>)[f]}: ${label(f, v)}`, off: () => toggle(f, v) }))),
    ...(s.theme.length === 1 ? [{ id: "theme", text: `${t.facets.theme}: ${(t.themes as Record<string, string>)[s.theme[0]!]}`, off: () => commit({ ...s, theme: [] }) }] : []),
    ...(s.included ? [{ id: "included", text: t.included, off: () => commit({ ...s, included: false }) }] : []),
    ...(s.hearted ? [{ id: "hearted", text: t.hearted, off: () => commit({ ...s, hearted: false }) }] : []),
  ]);
  const sortValue = $derived(out.sort);

  // more results as the end of the list nears
  $effect(() => {
    if (!sentinel) return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) shown += CHUNK; }, { rootMargin: "800px 0px" });
    io.observe(sentinel);
    return () => io.disconnect();
  });

  onMount(() => {
    open = window.innerWidth > 720; // on a phone the filters start folded
    // Back from a style opened out of this page: the URL already holds the search; a bare #/search after a card click gets the last one and its scroll
    let y = 0;
    try {
      const last = JSON.parse(sessionStorage.getItem(LAST) ?? "null") as { hash: string; y: number; back: boolean } | null;
      if (last?.back && !location.hash.includes("?") && last.hash.includes("?")) { commit(parseSearch(last.hash)); y = last.y; }
      else if (last?.back) y = last.hash === searchHash(s) ? last.y : 0;
      if (last) sessionStorage.setItem(LAST, JSON.stringify({ ...last, back: false }));
    } catch { /* no usable session state */ }
    save(false);
    if (y) void tick().then(() => { shown = Math.max(shown, CHUNK * Math.ceil((y + innerHeight) / 300)); void tick().then(() => window.scrollTo(0, y)); });
  });
</script>

<main id="main-content" class="mg-main mg-search" data-testid="magazine-search" data-count={out.results.length} data-sort={out.sort} data-ms={ms}>
  <p class="mg-crumbs"><a class="mg-link" href="#/">{ui.style.back}</a></p>
  <h1 class="mg-h1">{t.heading}</h1>
  <p class="mg-note">{t.note}</p>

  <div class="mg-sbar">
    <label class="mg-field mg-field-q"><span class="mg-flabel">{t.label}</span>
      <input class="mg-input" type="search" name="q" value={s.q} placeholder={t.placeholder} autocomplete="off" spellcheck="false" data-testid="search-q" oninput={(e) => commit({ ...s, q: e.currentTarget.value })} />
    </label>
    <label class="mg-field"><span class="mg-flabel">{t.sort}</span>
      <select class="mg-input" value={sortValue} data-testid="search-sort" onchange={(e) => commit({ ...s, sort: e.currentTarget.value as Sort })}>
        {#each SORTS as o (o)}
          <option value={o} disabled={(o === "relevance" && !s.q) || (o === "similar" && !similar)}>{(t.sorts as Record<string, string>)[o]}</option>
        {/each}
      </select>
    </label>
  </div>

  <details class="mg-filters" bind:open data-testid="search-filters">
    <summary>{t.filters}{active ? ` (${active})` : ""}</summary>
    <div class="mg-facets">
    {#each FACETS as f (f)}
      <fieldset class="mg-facet" data-facet={f}>
        <legend>{(t.facets as Record<string, string>)[f]}</legend>
        <div class="mg-chips-row">
          {#each FACET_VALUES[f] as v (v)}
            {@const n = out.facets[f].get(v) ?? 0}
            {@const on = (s[f] as (string | number)[]).includes(v)}
            <button type="button" class="mg-fchip" aria-pressed={on} data-zero={n === 0 ? "1" : "0"} data-testid={`chip-${f}-${v}`} data-count={n} onclick={() => toggle(f, v)}>{label(f, v)} <span class="mg-fcount">{n}</span></button>
          {/each}
        </div>
      </fieldset>
    {/each}
    <fieldset class="mg-facet" data-facet="theme">
      <legend>{t.facets.theme}</legend>
      <div class="mg-chips-row">
        {#each ["light", "dark"] as v (v)}
          <button type="button" class="mg-fchip" aria-pressed={s.theme.includes(v as "light" | "dark")} data-testid={`chip-theme-${v}`} onclick={() => toggleTheme(v as "light" | "dark")}>{(t.themes as Record<string, string>)[v]} <span class="mg-fcount">{out.results.length}</span></button>
        {/each}
      </div>
    </fieldset>
    <fieldset class="mg-facet" data-facet="show">
      <legend>{t.facets.show}</legend>
      <div class="mg-chips-row">
        <button type="button" class="mg-fchip" aria-pressed={s.included} data-testid="chip-included" data-count={out.included} onclick={() => commit({ ...s, included: !s.included })}>{t.included} <span class="mg-fcount">{out.included}</span></button>
        <button type="button" class="mg-fchip" aria-pressed={s.hearted} data-testid="chip-hearted" data-count={out.hearted} onclick={() => commit({ ...s, hearted: !s.hearted })}>{t.hearted} <span class="mg-fcount">{out.hearted}</span></button>
      </div>
    </fieldset>
    </div>
  </details>

  <div class="mg-status">
    <p class="mg-count" role="status" aria-live="polite" data-testid="result-count">{countText}</p>
    {#if chips.length}
      <ul class="mg-active" aria-label={t.active} data-testid="active-filters">
        {#each chips as c (c.id)}
          <li><button type="button" class="mg-achip" aria-label={`${t.clearOne}: ${c.text}`} data-testid="active-chip" onclick={c.off}>{c.text} <span aria-hidden="true">×</span></button></li>
        {/each}
        <li><button type="button" class="mg-btn" data-testid="clear-filters" onclick={clear}>{t.clear}</button></li>
      </ul>
    {/if}
  </div>

  <section aria-label={t.results} data-testid="search-results">
    {#if out.results.length === 0}
      <div class="mg-empty" data-testid="search-empty">
        <p class="mg-h2">{t.empty}</p>
        <p class="mg-note">{t.emptyHint}</p>
        <button type="button" class="mg-btn mg-btn-primary" data-testid="empty-clear" onclick={clear}>{t.clear}</button>
      </div>
    {:else}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <div class="mg-grid" data-testid="search-grid" onclickcapture={(e) => { if ((e.target as HTMLElement).closest("a.mg-card")) save(true); }}>
        {#each visible as card (card.key)}
          <Card {card} {dark} />
        {/each}
      </div>
      {#if visible.length < out.results.length}
        <div class="mg-more" bind:this={sentinel}>
          <button type="button" class="mg-btn" data-testid="show-more" onclick={() => (shown += CHUNK)}>{t.more.replace("{n}", String(out.results.length - visible.length))}</button>
        </div>
      {/if}
    {/if}
  </section>
</main>
