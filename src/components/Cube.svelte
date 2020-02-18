<script>
  import { cube, player, playerName } from "../stores.js";
  import { checker } from "../util.js";

  import Square from "./Square.svelte";

  $: gameWon = checker($cube).some(x => x);
  $: showPlayer = gameWon && $playerName[(($player + 1) % 2) + 1];

  const reset = () => {
    $cube = Array(3)
      .fill()
      .map(_ =>
        Array(3)
          .fill()
          .map(_ =>
            Array(3)
              .fill()
              .map(_ => null)
          )
      );
    $player = 0;
  };
</script>

<style lang="scss">
  div {
    grid-column: 1 / 4;
    justify-content: space-evenly;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
  }

  h2 {
    font-size: 2.5em;
    font-weight: bold;
  }
</style>

{#each $cube as square, squareIndex}
  <Square z={squareIndex} allow={!gameWon} />
{/each}

{#if gameWon}
  <div>
    <h2>
      {@html showPlayer}
      has won!
    </h2>
    <p>
      <button on:click|preventDefault={reset}>Play again?</button>
    </p>
  </div>
{/if}
