import { LitElement, svg } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { customElement } from "lit/decorators.js";

import logo from "../public/logo.svg";

@customElement("esp-logo")
export default class EspLogo extends LitElement {
  render() {
    return unsafeSVG(logo);
  }
}
