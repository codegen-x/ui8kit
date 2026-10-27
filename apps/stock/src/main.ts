import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import { registerFonts } from "@ui8kit/taste-data/fonts";

registerFonts();
mount(App, { target: document.getElementById("app")! });
