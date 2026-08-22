import { defineConfig } from "vite";
import loadVersion from "vite-plugin-package-version";
import { viteSingleFile } from "vite-plugin-singlefile";
import stripBanner from "rollup-plugin-strip-banner";
import replace from "@rollup/plugin-replace";
import compress from "../../scripts/vite-plugin-compress";
import minifyHtml from "../../scripts/vite-plugin-minify-html";
import minifyLiterals from "../../scripts/vite-plugin-minify-literals";

const proxy_target = process.env.PROXY_TARGET || "http://nodemcu.local";

export default defineConfig({
  clearScreen: false,
  plugins: [
    stripBanner(),
    loadVersion(),
    minifyLiterals(),
    replace({
      "@license": "license",
      "Value passed to 'css' function must be a 'css' function result:":
        "use css function",
      "Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.":
        "Use unsafeCSS",
      delimiters: ["", ""],
      preventAssignment: true,
    }),
    // deleteInlinedFiles: false keeps the standalone www.js on disk after it
    // has been inlined into index.html. It is published to the CDN and users
    // point `js_url` at it instead of embedding the page in the firmware.
    viteSingleFile({ deleteInlinedFiles: false }),
    minifyHtml(),
    compress(/\.(js|css|html|svg)$/),
  ],
  build: {
    reportCompressedSize: false,
    // cssCodeSplit: true,
    outDir: "../../_static/v2",
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        chunkFileNames: "[name].js",
        assetFileNames: "www[extname]",
        entryFileNames: "www.js",
      },
    },
  },
  server: {
    open: "/", // auto open browser in dev mode
    host: true, // dev on local and network
    port: 5001,
    strictPort: true,
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
      "/text": proxy_target,
      "/date": proxy_target,
      "/time": proxy_target,
      "/valve": proxy_target,
      "/water_heater": proxy_target,
      "/infrared": proxy_target,
    },
  },
});
