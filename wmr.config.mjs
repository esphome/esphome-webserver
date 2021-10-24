import { defineConfig } from "wmr";
import { createProxyMiddleware } from "http-proxy-middleware";

import zip from "rollup-plugin-zip";

// Full list of options: https://wmr.dev/docs/configuration
// middleware https://github.com/preactjs/wmr/issues/297

const proxy_target = "http://nodemcu.local";
export default defineConfig((options) => {
  const proxy_events = createProxyMiddleware('/events',{
    //changeOrigin: true,
    logLevel: "debug",
    target: `${proxy_target}`,
  });
  const proxy_post = createProxyMiddleware({
    changeOrigin: true,
    logLevel: "debug",
    target: `${proxy_target}`, // /switch/relay/toggle
  });
  options.middleware.push((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (req.method === "POST") {
      console.dir(req.path)
      proxy_post(req, res, next);
      return;
    }
    if ( options.mode === "start" ) {
      if ( req.path === '/_static/webserver-v2.js') 
      { console.log('js!');
      req.path === '/public/webserver-v2.js';
    }
      if ( req.path === '/_static/webserver-v2.css') req.path === '/public/webserver-v2.css';
    }
    if (req.path.match(/^\/events(|$)/)) proxy_events(req, res, next);
    else next();
  });
  return {
    output: { chunkFileNames: '[name].js',
     assetFileNames: '[name][extname]',
     dir:'dist/_static'
    },
    host: "0.0.0.0",
    port: 80,
    //debug: true,
    //visualize: true
  };
});
