import { LitElement, svg } from "lit";
// import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { customElement } from "lit/decorators.js";

import logo from "/logo.svg?raw";

@customElement("esp-logo")
export default class EspLogo extends LitElement {
  render() {
    // return unsafeSVG(logo);
    return svg([logo]);
  }
}
