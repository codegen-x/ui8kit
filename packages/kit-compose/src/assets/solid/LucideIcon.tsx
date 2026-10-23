/**
 * LucideIcon: a Lucide glyph (ISC license) by kebab-case name from the registry next to this file, inside the Icon primitive
 * (the kit-compose LucideIcon frame: span[data-slot=icon]). Decorative (the frame is aria-hidden) unless a `label` is given.
 */
import { For, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { LucideIcon as Frame } from "../compose";
import { LUCIDE } from "./lucide-icons";

export type LucideIconProps = { name: string; size?: number; strokeWidth?: number; label?: string; class?: string };

export function LucideIcon(props: LucideIconProps): JSX.Element {
  const nodes = () => LUCIDE[props.name] ?? LUCIDE["circle"] ?? [];
  return (
    <Frame label={props.label} class={props.class} data-lucide={props.name}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={props.size ?? 16} height={props.size ?? 16} fill="none" stroke="currentColor"
        stroke-width={props.strokeWidth ?? 2} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <For each={nodes()}>{([tag, attrs]) => <Dynamic component={tag} {...attrs} />}</For>
      </svg>
    </Frame>
  );
}
