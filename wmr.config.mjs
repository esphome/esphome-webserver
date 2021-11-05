import { defineConfig } from "wmr";
import { createProxyMiddleware } from "http-proxy-middleware";
import gzipPlugin from "rollup-plugin-gzip";
//import template from 'rollup-plugin-html-literals';
import { uglify } from 'rollup-plugin-uglify';

// this should be in env vars
const proxy_target = "http://nodemcu.local";
export default defineConfig((options) => {
  const proxy_events = createProxyMiddleware("/events", {
    target: `${proxy_target}`
  });
  const proxy_post = createProxyMiddleware({
    changeOrigin: true,
    target: `${proxy_target}`
  });
  options.middleware.push((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    // development: redirect _static folder
    if (options.mode === "start" && req.path.startsWith("/_static")) {
      res.writeHead(302, { Location: req.path.replace("/_static", ""), "Access-Control-Allow-Origin": "*" });
      return res.end("");
    }
    if (req.method === "POST") {
      proxy_post(req, res, next);
      next();
      return;
    }
    if (req.path.match(/^\/events(|$)/)) proxy_events(req, res, next);
    else next();
  });
  options.plugins = [
    //template(),
    uglify(),
    {
    ...gzipPlugin({ filter: /\.(js|css|html|svg)$/, additionalFiles: ['./public/esphome.svg']
    }),
    enforce: 'post',
    apply: 'build'
  }];
  return {
    output: { chunkFileNames: "[name].js", assetFileNames: "[name][extname]", dir: "dist/_static" },
    host: "0.0.0.0",
    port: 80,
    //debug: true,
    //visualize: true,
    
  };
});
