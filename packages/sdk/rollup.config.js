import json from "@rollup/plugin-json";
import typescriptPlugin from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";
import typescript from "typescript";
import pkg from "./package.json";

const deps = Object.keys(Object.assign({}, pkg.peerDependencies, pkg.dependencies));

const nodeDeps = [...deps, "crypto"];

/**
 * ES5 Builds
 */
const es5BuildPlugins = [
  typescriptPlugin({
    typescript,
    abortOnError: false,
  }),
  json(),
];

/**
 * ES2017 Builds
 */
const es2017Plugins = [
  typescriptPlugin({
    typescript,
    tsconfigOverride: {
      compilerOptions: {
        target: "es2017",
      },
    },
    abortOnError: false,
  }),
  json({ preferConst: true }),
];

const es5Builds = [
  /**
   * Browser Builds
   */
  {
    input: "src/index.browser.ts",
    output: [{ file: pkg.esm5, format: "es", sourcemap: true }],
    external: (id) => deps.some((dep) => id === dep || id.startsWith(`${dep}/`)),
    plugins: [...es5BuildPlugins],
    treeshake: {
      moduleSideEffects: false,
    },
  },
  /**
   * Node.js Build
   */
  {
    input: "src/index.ts",
    output: [{ file: pkg.main, format: "cjs", sourcemap: true }],
    external: (id) => nodeDeps.some((dep) => id === dep || id.startsWith(`${dep}/`)),
    plugins: [
      typescriptPlugin({
        typescript,
        abortOnError: false,
        useTsconfigDeclarationDir: true,
      }),
      json(),
    ],
  },
];

const es2017Builds = [
  // Node
  {
    input: "./src/index.ts",
    output: {
      file: pkg.module,
      format: "es",
      sourcemap: true,
    },
    plugins: [...es2017Plugins],
    external: (id) => nodeDeps.some((dep) => id === dep || id.startsWith(`${dep}/`)),
    treeshake: {
      moduleSideEffects: false,
    },
  },

  // Browser
  {
    input: "./src/index.browser.ts",
    output: {
      file: pkg.browser,
      format: "es",
      sourcemap: true,
    },
    plugins: [...es2017Plugins],
    external: (id) => deps.some((dep) => id === dep || id.startsWith(`${dep}/`)),
    treeshake: {
      moduleSideEffects: false,
    },
  },
];

const containerBuild = [
  {
    input: "./src/container/index.ts",
    output: {
      file: "dist/internal.js",
      format: "es",
      sourcemap: true,
    },
    plugins: [...es2017Plugins],
    external: (id) => nodeDeps.some((dep) => id === dep || id.startsWith(`${dep}/`)),
    treeshake: {
      moduleSideEffects: false,
    },
  },
  {
    input: "./dist/src/container/index.d.ts",
    output: [{ file: "types/internal.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default [...es5Builds, ...es2017Builds, ...containerBuild];
