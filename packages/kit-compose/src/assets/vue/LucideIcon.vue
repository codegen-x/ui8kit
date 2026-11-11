<!--
  LucideIcon: a Lucide glyph (ISC license) by kebab-case name (any glyph of the `lucide` package, through ./lucide-icons), inside the Icon primitive
  (the kit-compose LucideIcon frame: span[data-slot=icon]). Decorative (the frame is aria-hidden) unless a `label` is given.
-->
<script lang="ts">
export type LucideIconProps = { name: string; size?: number; strokeWidth?: number; label?: string; class?: string };
</script>

<script setup lang="ts">
import { computed } from "vue";
import Frame from "../compose/LucideIcon.vue";
import { lucideNodes } from "./lucide-icons";

defineOptions({ inheritAttrs: false });
const { name, size = 16, strokeWidth = 2, label, class: className } = defineProps<LucideIconProps>();
const nodes = computed(() => lucideNodes(name) ?? lucideNodes("circle") ?? []);
</script>

<template>
  <Frame :label="label" :class="className" :data-lucide="name">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :width="size" :height="size" fill="none" stroke="currentColor"
      :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <component :is="tag" v-for="([tag, attrs], i) in nodes" :key="i" v-bind="attrs" />
    </svg>
  </Frame>
</template>
