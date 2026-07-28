import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import compress from "../../scripts/vite-plugin-compress";
import minifyHtml from "../../scripts/vite-plugin-minify-html";

export default defineConfig({
  clearScreen: false,
  plugins: [viteSingleFile(), minifyHtml(), compress(/\.html$/)],
  css: {
    postcss: {},
  },
  build: {
    reportCompressedSize: false,
    cssCodeSplit: false,
    outDir: "../../_static/captive_portal",
    assetsInlineLimit: 100000000,
    modulePreload: { polyfill: false },
  },
  server: {
    open: "/", // auto open browser
  },
});
