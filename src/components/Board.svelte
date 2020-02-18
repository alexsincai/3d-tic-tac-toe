<script>
  import Cube from "./Cube.svelte";
</script>

<style lang="scss" global>
  @import "css-reset-and-normalize/scss/reset-and-normalize";

  body {
    width: 50vw;
    height: 50vh;
    margin: 25vh 25vw;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-gap: 3em;
  }

  body,
  button {
    background: #333;
    color: aqua;
  }

  button {
    padding: 0.25em;
    border: 0.1em solid;
    border-radius: 0.5em;
    font-size: 1.3em;
    transition: all 0.25s;

    &:hover {
      background: #555;
    }
  }
</style>

<Cube />
