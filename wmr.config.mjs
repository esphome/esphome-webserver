import { defineConfig } from "wmr";
import { createProxyMiddleware } from "http-proxy-middleware";

import zip from "rollup-plugin-zip";

// Full list of options: https://wmr.dev/docs/configuration
// middleware https://github.com/preactjs/wmr/issues/297

const proxy_target = "http://aroha-garage-mini.local";
export default defineConfig((options) => {
  const proxy_events = createProxyMiddleware({
    changeOrigin: true,
    logLevel: "debug",
    target: `${proxy_target}/events`,
  });
  const proxy_post = createProxyMiddleware({
    changeOrigin: true,
    logLevel: "debug",
    target: `${proxy_target}/switch/garage_control/toggle`,
  });
  options.middleware.push((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method === "POST") proxy_post(req, res, next);
    if (req.path.match(/^\/events(|$)/)) proxy_events(req, res, next);
    else next();
  });
  return {
    output: options.mode === "build" ? { file: "./dist/webserver-v2.js" } : {},
    host: "0.0.0.0",
    port: 80,
    debug: true,
    //visualize: true
  };
});
