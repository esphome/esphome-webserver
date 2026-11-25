import { brotliCompressSync } from "zlib";
import { gzipAsync } from "@gfx/zopfli";
import type { Plugin } from "vite";

/**
 * Emit a gzip and a brotli copy of every matching build output.
 *
 * Replaces rollup-plugin-gzip, which mutated the `bundle` object directly.
 * Rolldown ignores those mutations, so no compressed files were written and
 * scripts/make_header.sh failed its existence check. this.emitFile() is the
 * supported way to add files to the bundle and works under both Rollup and
 * Rolldown.
 */
export default function compress(filter: RegExp): Plugin {
  return {
    name: "esphome:compress",
    enforce: "post",
    apply: "build",
    async generateBundle(_options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (!filter.test(fileName)) continue;
        const content = Buffer.from(
          chunk.type === "asset" ? chunk.source : chunk.code
        );
        this.emitFile({
          type: "asset",
          fileName: `${fileName}.gz`,
          source: await gzipAsync(content, { numiterations: 15 }),
        });
        this.emitFile({
          type: "asset",
          fileName: `${fileName}.br`,
          source: brotliCompressSync(content),
        });
      }
    },
  };
}
