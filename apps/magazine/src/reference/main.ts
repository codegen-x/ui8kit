// Research entry only. No magazine state, picks storage, or panorama engine.
import { mount } from 'svelte';
import '../app.css';
import { registerFonts } from '@ui8kit/taste-data/fonts';
import App from './App.svelte';
registerFonts();
mount(App, { target: document.getElementById('app')! });