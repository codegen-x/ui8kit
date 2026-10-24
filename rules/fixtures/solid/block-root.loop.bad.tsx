// Self-test fixture of the rules group, detector block-root, case loop (violating): a Block per item of For.
import { For } from "solid-js";
import { Block, Text } from "@codegen-x/solid-compose";

export function Fixture({ items = [] as string[] }) {
  return (
    <For each={items}>
      {(item) => (
        <Block tag="section">
          <Text>{item}</Text>
        </Block>
      )}
    </For>
  );
}
