import { writable, readable } from "svelte/store";

export let cube = writable(
  Array(3)
    .fill()
    .map(_ =>
      Array(3)
        .fill()
        .map(_ =>
          Array(3)
            .fill()
            .map(_ => null),
        ),
    ),
);

export let player = writable(0);

export const playerName = readable(["&nbsp;", "&times;", "&#9711;"]);
