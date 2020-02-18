module.exports = {
  css: ["public/**/*.css"],
  content: ["public/index.html", "public/**/*.js"],
  output: ["public/build/"],
  whitelistPatterns: [/svelte-/],
  whitelistPatternsChildren: [/svelte-/],
  keyframes: true,
  fontFace: true,
  variables: true,
};
