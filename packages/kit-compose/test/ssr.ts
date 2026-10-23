// SSR loaders for the tests (Svelte server compile, Vue SFC inline template, Solid babel ssr), installed once per process.
import { plugin } from "bun";
import { readFileSync } from "node:fs";

export function installSsrPlugin(): void {
  const g = globalThis as { __kitComposeSsr?: boolean };
  if (g.__kitComposeSsr) return;
  g.__kitComposeSsr = true;
  plugin({
    name: "compose-ssr",
    async setup(b) {
      const { compile } = await import("svelte/compiler");
      const { parse, compileScript } = await import("@vue/compiler-sfc");
      const { transformSync } = await import("@babel/core");
      const solid = (await import("babel-preset-solid")).default;
      const ts = (await import("@babel/preset-typescript")).default;
      b.onLoad({ filter: /\.svelte$/ }, ({ path }) => ({
        loader: "js",
        contents: compile(readFileSync(path, "utf8"), { generate: "server", filename: path }).js.code,
      }));
      b.onLoad({ filter: /\.vue$/ }, ({ path }) => {
        const { descriptor } = parse(readFileSync(path, "utf8"), { filename: path });
        return { loader: "ts", contents: compileScript(descriptor, { id: path, inlineTemplate: true }).content };
      });
      // compositions (*.solid.tsx) and the organisms of solid/src (*.tsx)
      b.onLoad({ filter: /(\.solid\.tsx|\/solid\/src\/(blocks|components|icons)\/[^/]+\.tsx)$/ }, ({ path }) => ({
        loader: "js",
        contents: transformSync(readFileSync(path, "utf8"), { filename: path, babelrc: false, configFile: false,
          presets: [[ts, { isTSX: true, allExtensions: true }], [solid, { generate: "ssr", hydratable: false }]] })!.code!,
      }));
    },
  });
}
