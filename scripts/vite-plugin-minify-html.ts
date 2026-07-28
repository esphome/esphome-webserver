import { minify, type Options } from "html-minifier-next";
import type { Plugin } from "vite";

/**
 * Minify the emitted index.html.
 *
 * Replaces vite-plugin-html, which is unmaintained and pulled in a large
 * dependency tree for the one feature used here.
 *
 * Order matters: this must run after vite-plugin-singlefile, because
 * removeAttributeQuotes rewrites `src="www.js"` to `src=www.js`, which the
 * singlefile inliner no longer matches. Getting that wrong silently drops all
 * the JavaScript from the page instead of failing the build.
 */
export default function minifyHtml(options: Options = {}): Plugin {
  return {
    name: "esphome:minify-html",
    enforce: "post",
    apply: "build",
    async generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "asset" || !chunk.fileName.endsWith(".html")) {
          continue;
        }
        chunk.source = await minify(String(chunk.source), {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          keepClosingSlash: true,
          minifyCSS: true,
          minifyURLs: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeDefaultTypeAttributes: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          ...options,
        });
      }
    },
  };
}
