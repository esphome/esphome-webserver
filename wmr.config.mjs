import { defineConfig } from "wmr";
import { terser } from "rollup-plugin-terser";
import { createProxyMiddleware } from "http-proxy-middleware";
import gzipPlugin from "rollup-plugin-gzip";
import minifyHTML from 'rollup-plugin-minify-html-template-literals'
//import postcss from 'rollup-plugin-postcss';

// this should be in env vars
const proxy_target = "http://nodemcu.local";
export default defineConfig((options) => {
  if (options.mode === "start" || options.mode === "serve") {
    const proxy_events = createProxyMiddleware("/events", {
      target: `${proxy_target}`,
    });
    const proxy_post = createProxyMiddleware({
      changeOrigin: true,
      target: `${proxy_target}`,
    });
    options.middleware.push((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (req.method === "POST") {
        proxy_post(req, res, next);
        next();
        return;
      }
      if (req.path.match(/^\/events(|$)/)) proxy_events(req, res, next);
      else next();
    });
  }
  options.plugins = [
    //postcss({ //modules: true }),
    minifyHTML(),
    terser({
      ecma: 2019,
      toplevel: true,
      output: {
        comments: false,
      },
    }),
    {
      ...gzipPlugin({ filter: /\.(js|css|html|svg)$/, additionalFiles: [] }),
      enforce: "post",
      apply: "build",
    },
  ];
  return {
    output: { chunkFileNames: "[name].js", assetFileNames: "[name][extname]", dir: "../www/_static" },
    host: "0.0.0.0",
    //port: 80,
    //debug: true,
    //visualize: true,
  };
});
