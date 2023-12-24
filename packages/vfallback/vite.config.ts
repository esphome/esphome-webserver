import { defineConfig } from "vite";
import gzipPlugin from "rollup-plugin-gzip";
import minifyHTML from "rollup-plugin-minify-html-template-literals";
import { brotliCompressSync, constants as zlib_constants } from "zlib";
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
    //TODO!!: rename file to a simple name
    {
      ...gzipPlugin({
        filter: /\.(js|css|html|svg)$/,
        gzipOptions: {
          level: 9,
          memLevel: 9,
        },
        additionalFiles: [],
        customCompression: (content) =>
          brotliCompressSync(Buffer.from(content), {
            // params: {
            //   [zlib_constants.BROTLI_PARAM_QUALITY]: 11,
            // },
          }),
        // fileName: ".br",
      }),
      enforce: "post",
      apply: "build",
    },
    //server_index_fallback.h
    // {
    //   ...gzipPlugin({ filter: /\.(js|css|html|svg)$/ }),
    //   enforce: "post",
    //   apply: "build",
    // },
    // encode to hex -- https://tomeko.net/online_tools/file_to_hex.php?lang=en
  ],
  build: {
    brotliSize: false,
    // cssCodeSplit: true,
    outDir: "../_static/vfallback",
    polyfillModulePreload: false,
    rollupOptions: {
      output: {
        // manualChunks: (chunk) => {
        //   return "vendor";
        // }, // create one js bundle,
        // chunkFileNames: "[name].js",
        // assetFileNames: "www[extname]",
        // entryFileNames: "www.js",
      },
    },
  },
  server: {
    open: "/", // auto open browser in dev mode
    host: true, // dev on local and network
    port: 5002,
    strictPort: true,
    proxy: {
      "/events": proxy_target,
    },
  },
});
