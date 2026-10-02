import { minifyHTMLLiterals } from "minify-literals";
import type { Plugin } from "vite";

/**
 * Minify the html`` and css`` tagged template literals in lit components.
 *
 * Replaces rollup-plugin-minify-html-template-literals, which was last
 * published in 2020 and pulls in an unmaintained html-minifier chain.
 */
export default function minifyLiterals(): Plugin {
  return {
    name: "esphome:minify-literals",
    enforce: "pre",
    apply: "build",
    async transform(code, id) {
      const file = id.split("?")[0];
      // Dependencies ship pre-built; minifying them only produces warnings
      // about constructs like unsafeCSS() that we cannot act on anyway.
      if (!/\.[jt]s$/.test(file) || file.includes("/node_modules/")) return null;
      const result = await minifyHTMLLiterals(code, { fileName: id });
      if (!result) return null;
      return { code: result.code, map: result.map };
    },
  };
}
