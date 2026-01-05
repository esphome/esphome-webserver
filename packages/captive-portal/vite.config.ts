import { defineConfig } from "vite";
import gzipPlugin from "rollup-plugin-gzip";
import minifyHTML from "rollup-plugin-minify-html-template-literals";
import { brotliCompressSync } from "zlib";
import { viteSingleFile } from "vite-plugin-singlefile";
import { minifyHtml as ViteMinifyHtml } from "vite-plugin-html";

export default defineConfig({
  clearScreen: false,
  plugins: [
    viteSingleFile(),
    { ...minifyHTML(), enforce: "pre", apply: "build" },
    ViteMinifyHtml(),
    {
      ...gzipPlugin({
        filter: /\.(html)$/,
        additionalFiles: [],
        customCompression: (content) =>
          brotliCompressSync(Buffer.from(content)),
        fileName: ".br",
      }),
      enforce: "post",
      apply: "build",
    },
    {
      ...gzipPlugin({ filter: /\.(html)$/ }),
      enforce: "post",
      apply: "build",
    },
  ],
  css: {
    postcss: {},
  },
  build: {
    brotliSize: false,
    cssCodeSplit: false,
    outDir: "../../_static/captive_portal",
    assetsInlineLimit: 100000000,
    polyfillModulePreload: false,
  },
  server: {
    open: "/", // auto open browser
  },
});
