import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import autoPreprocess from "svelte-preprocess";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.js",
  output: {
    sourcemap: false,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    svelte({
      css: css => {
        css.write("public/build/bundle.css");
      },
      preprocess: autoPreprocess({
        // postcss: true,
        postcss: {
          css: ["public/**/*.css"],
          content: ["public/index.html", "public/**/*.js"],
          output: ["public/build/"],
          whitelistPatterns: [/svelte-/],
          whitelistPatternsChildren: [/svelte-/],
          keyframes: true,
          fontFace: true,
          variables: true,
        },
      }),
      dev: !production,
    }),

    resolve({
      browser: true,
      dedupe: importee =>
        importee === "svelte" || importee.startsWith("svelte/"),
    }),
    commonjs(),

    !production && serve(),

    !production && livereload("public"),

    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        });
      }
    },
  };
}
