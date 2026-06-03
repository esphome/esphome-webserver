import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

import logo from "/logo.svg?raw";

@customElement("esp-logo")
export default class EspLogo extends LitElement {
  render() {
    return html(Object.assign([logo], { raw: [logo] }));
  }
}
