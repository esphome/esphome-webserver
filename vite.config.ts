import { defineConfig } from "vite";
import gzipPlugin from "rollup-plugin-gzip";
import minifyHTML from "rollup-plugin-minify-html-template-literals";
import { brotliCompressSync } from "zlib";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import loadVersion from "vite-plugin-package-version";
import { viteSingleFile } from "vite-plugin-singlefile";
import { minifyHtml as ViteMinifyHtml } from "vite-plugin-html";
import copy from "rollup-plugin-copy";
import stripBanner from "rollup-plugin-strip-banner";
import replace from "@rollup/plugin-replace";

const proxy_target = "http://nodemcu.local";

export default defineConfig({
  clearScreen: false,
  plugins: [
    {
      ...nodeResolve({ exportConditions: ["development"] }),
      enforce: "pre",
      apply: "start",
    },
    stripBanner(),
    loadVersion(),
    { ...minifyHTML(), enforce: "pre", apply: "build" },
    //
    {
      ...ViteMinifyHtml({ removeComments: true }),
      enforce: "post",
      apply: "build",
    },
    replace({
      "@license": "license",
      "Value passed to 'css' function must be a 'css' function result:":
        "use css function",
      "Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.":
        "Use unsafeCSS",
      delimiters: ["", ""],
      preventAssignment: true,
    }),
    viteSingleFile(),
    {
      ...gzipPlugin({
        filter: /\.(js|css|html|svg)$/,
        additionalFiles: [],
        customCompression: (content) =>
          brotliCompressSync(Buffer.from(content)),
        fileName: ".br",
      }),
      enforce: "post",
      apply: "build",
    },
    {
      ...gzipPlugin({ filter: /\.(js|css|html|svg)$/ }),
      enforce: "post",
      apply: "build",
    },
    {
      ...copy({
        targets: [{ src: "v1/*", dest: "_static/v1" }],
        verbose: true,
      }),
      enforce: "pre",
      apply: "build",
    },
  ],
  build: {
    brotliSize: false,
    // cssCodeSplit: true,
    outDir: "_static/v2",
    polyfillModulePreload: false,
    rollupOptions: {
      output: {
        manualChunks: (chunk) => {
          return "vendor";
        }, // create one js bundle,
        chunkFileNames: "[name].js",
        assetFileNames: "www[extname]",
        entryFileNames: "www.js",
      },
    },
  },
  server: {
    open: "/", // auto open browser in dev mode
    host: true, // dev on local and network
    proxy: {
      "/light": proxy_target,
      "/select": proxy_target,
      "/cover": proxy_target,
      "/switch": proxy_target,
      "/button": proxy_target,
      "/fan": proxy_target,
      "/lock": proxy_target,
      "/number": proxy_target,
      "/climate": proxy_target,
      "/events": proxy_target,
    },
  },
});
