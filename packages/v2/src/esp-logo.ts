import { LitElement, css } from "lit";
import { customElement } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import logo from "/logo.svg?raw";

@customElement("esp-logo")
export default class EspLogo extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `;

  render() {
    // The logo is a trusted build-time asset inlined by vite's `?raw` import.
    return unsafeHTML(logo);
  }
}
