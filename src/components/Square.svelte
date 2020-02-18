<script>
  import { cube, player, playerName } from "../stores.js";

  export let z;
  export let allow;

  $: showCell = (x, y) => {
    let cell = $cube[z][y][x];
    if (cell === null) return $playerName[0];
    return $playerName[cell + 1];
  };

  const handleClick = (x, y) => {
    if ($cube[z][y][x] === null && allow) {
      $cube[z][y][x] = $player;
      $player = ($player + 1) % 2;
    }
  };
</script>

<style lang="scss">
  div {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);

    transform: skew(-30deg);
  }

  button {
    font-size: 2em;
  }
</style>

<div>
  {#each $cube[z] as row, rowIndex}
    {#each row as cell, cellIndex}
      <button on:click|preventDefault={e => handleClick(cellIndex, rowIndex)}>
        {@html showCell(cellIndex, rowIndex)}
      </button>
    {/each}
  {/each}
</div>
