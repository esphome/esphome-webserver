import { defineConfig } from "vite";
import gzipPlugin from "rollup-plugin-gzip";
import minifyHTML from "rollup-plugin-minify-html-template-literals";
import { brotliCompressSync } from "zlib";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import loadVersion from "vite-plugin-package-version";
import { viteSingleFile } from "vite-plugin-singlefile";
import { minifyHtml as ViteMinifyHtml } from "vite-plugin-html";
import copy from "rollup-plugin-copy";

const proxy_target = "http://nodemcu.local";

export default defineConfig({
  clearScreen: false,
  plugins: [
    loadVersion(),
    { ...minifyHTML(), enforce: "pre", apply: "build" },
    viteSingleFile(),
    ViteMinifyHtml(),
    { ...nodeResolve({ exportConditions: ["development"] }) },
    {
      ...gzipPlugin({ filter: /\.(js|css|html|svg)$/, additionalFiles: [], customCompression: (content) => brotliCompressSync(Buffer.from(content)), fileName: ".br" }),
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
    cssCodeSplit: true,
    outDir: "_static/v2",
    polyfillModulePreload: false,
    comments: false,
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
      "/fan": proxy_target,
      "/number": proxy_target,
      "/climate": proxy_target,
      "/events": proxy_target,
    },
  },
});
