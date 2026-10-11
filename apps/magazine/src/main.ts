import { mount } from "svelte";
import "./app.css";
import own from "./magazine.css?inline";
import App from "./App.svelte";
import { registerFonts } from "@ui8kit/taste-data/fonts";

// the magazine's own rules: a separate <style>, not part of the document CSS that snapshots carry (see app.css)
const style = document.createElement("style");
style.dataset.snapshotSkip = "";
style.textContent = own;
document.head.appendChild(style);

registerFonts();
mount(App, { target: document.getElementById("app")! });
