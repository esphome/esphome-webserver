import { defineConfig } from "wmr";

// Full list of options: https://wmr.dev/docs/configuration
export default defineConfig({
  /* Your configuration here */
  alias: {
    react: "preact/compat",
    "react-dom": "preact/compat",
  },
  build: {
    brotliSize: false,
    cssCodeSplit: true,
    cleanCssOptions: {
      level: 2,
    },
    rollupOptions: {
      output: {
        manualChunks: () => "everything.js", // create one js bundle
      },
    },
  },
  server: {
    open: "/", // auto open browser in dev mode
    host: true, // and on dev ip
  },
});
