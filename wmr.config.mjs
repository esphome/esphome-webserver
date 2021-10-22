import { defineConfig } from "wmr";

import zip from 'rollup-plugin-zip'

// Full list of options: https://wmr.dev/docs/configuration

export default defineConfig(options => {
    console.dir(options)
      return {
        output: {
          file: './dist/webserver-v2.js'
        },
        host: '0.0.0.0',
        port: 8080
        /*
          // configuration specific to production builds
          plugins: [
          {
            ...zip({
              file: './www.zip'
            }),
            enforce: 'post',
            apply: 'build'
          }
        ]
        */
      };
    });