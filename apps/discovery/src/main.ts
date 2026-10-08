import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import { registerFonts } from "./fonts";

registerFonts();
mount(App, { target: document.getElementById("app")! });
