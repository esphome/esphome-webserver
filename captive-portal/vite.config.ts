import { defineConfig } from "vite";
import gzipPlugin from "rollup-plugin-gzip";
import { viteSingleFile } from 'vite-plugin-singlefile'
import { minifyHtml } from 'vite-plugin-html';

export default defineConfig({
  clearScreen: false,
  plugins: [
    viteSingleFile(),
    minifyHtml(),
    {
      ...gzipPlugin({ filter: /\.(html)$/ }),
        enforce: "post",
        apply: "build",
      },
  ],
  css: {
    postcss: {
    },
},
  build: {
    brotliSize: false,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
  },
  server: {
    open: "/", // auto open browser
  },
});
