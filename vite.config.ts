import { defineConfig } from "vite";
import { createProxyMiddleware } from "http-proxy-middleware";
import gzipPlugin from "rollup-plugin-gzip";
import minifyHTML from "rollup-plugin-minify-html-template-literals";
import { brotliCompressSync } from "zlib";
import { nodeResolve } from '@rollup/plugin-node-resolve';

// should be from env and default to off
const proxy_target = "http://nodemcu.local";

export default defineConfig({
  plugins: [
    { ...minifyHTML(), enforce: "pre", apply: "build" },
    { ...nodeResolve({ exportConditions: ['development']})},
    {
      ...gzipPlugin({ filter: /\.(js|css|html|svg)$/, additionalFiles: [], customCompression: (content) => brotliCompressSync(Buffer.from(content)), fileName: ".br" }),
      enforce: "post",
      apply: "build",
    },
  ],
  build: {
    brotliSize: false,
    cssCodeSplit: true,
    outDir: "_static/v2",
    polyfillModulePreload: false,
    rollupOptions: {
      output: {
        manualChunks: (chunk) => {return "vendor"}, // create one js bundle,
        chunkFileNames: "[name].js",
        assetFileNames: "www[extname]",
        entryFileNames: "www.js",
      },
    },
  },
  server: {
    open: "/", // auto open browser in dev mode
    host: true, // dev also on ip
    proxy: {
      "/light": proxy_target, 
      "/select": proxy_target, 
      "/cover": proxy_target, 
      "/switch": proxy_target, 
      "/fan": proxy_target, 
      "/number": proxy_target, 
      "/climate": proxy_target, 
      "/events": proxy_target 
    },
  },
});
