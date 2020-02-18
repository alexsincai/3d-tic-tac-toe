import Board from "./components/Board.svelte";

const board = new Board({
  target: document.body,
});

window.board = board;
export default board;
