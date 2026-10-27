import { mount } from "svelte";
import "./app.css";
import own from "./magazine.css?inline";
import layouts from "./layouts.css?inline";
import App from "./App.svelte";
import { registerFonts } from "@ui8kit/taste-data/fonts";

// the magazine's own rules: a separate <style>, not part of the document CSS that snapshots carry (see app.css)
// and the utilities of its layouts (layouts.css), the same way
for (const css of [own, layouts]) {
  const style = document.createElement("style");
  style.dataset.snapshotSkip = "";
  style.textContent = css;
  document.head.appendChild(style);
}

registerFonts();
mount(App, { target: document.getElementById("app")! });
