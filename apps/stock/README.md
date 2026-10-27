# stock

A hand-written app (not generated): a stock-site storefront over the repository's blocks, sections (organisms), screens and skins.
Svelte 5 + Vite + Tailwind 4, hash router, base `/stock/`.

    bun run dev          # http://127.0.0.1:5187/stock/
    bun run build        # vite build to dist/ (preview: bun run preview, port 5188)
    bun run check        # svelte-check
    bun run test         # unit tests (also part of the root bun run test)

Steps of the plan: S0 the frame (header with the search, empty results).
