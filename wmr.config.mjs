import { defineConfig } from "wmr";

/*
import nomodule from '@wmrjs/nomodule';

export function build(config) {
	nomodule(config);
}
*/

// Full list of options: https://wmr.dev/docs/configuration
export default defineConfig({
  /* Your configuration here */
  alias: {
    react: "preact/compat",
    "react-dom": "preact/compat",
  }
});
