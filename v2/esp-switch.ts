import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssReset from "./css/reset";

@customElement("esp-switch")
export class EspSwitch extends LitElement {
  // Use arrays - or slots
  @property({ type: String }) labelOn = "On";
  @property({ type: String }) labelOff = "Off";
  @property({ type: String }) stateOn = "ON";
  @property({ type: String }) stateOff = "OFF";
  @property({ type: String }) state = "OFF";
  @property({ type: String }) color = "currentColor";
  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean }) disabled = false;

  toggle(): void {
    this.checked = !this.checked;
    this.state = this.checked ? this.stateOn : this.stateOff;
    let event = new CustomEvent("state", {
      detail: { state: this.state, id: this.id },
    });
    this.dispatchEvent(event);
  }

  requestUpdate(name?: PropertyKey, oldValue?: unknown) {
    if (name && name == "state" && this.state !== oldValue) {
      this.checked = this.state === this.stateOn;
    }
    return super.requestUpdate(name, oldValue);
  }

  connectedCallback() {
    super.connectedCallback();
    this.checked = this.state === this.stateOn;
  }

  render() {
    return html`
      <div class="sw">
        <label>
          ${this.labelOff}
          <input
            type="checkbox"
            ?checked="${this.checked}"
            ?disabled="${this.disabled}"
            @click="${this.toggle}"
          />
          <span style="color:${this.color}" class="lever"></span>
          ${this.labelOn}
        </label>
      </div>
    `;
  }

  static get styles() {
    return [
      cssReset,
      css`
        .sw,
        .sw * {
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }

        .sw label {
          cursor: pointer;
        }

        .sw label input[type="checkbox"] {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .sw label input[type="checkbox"]:checked + .lever {
          background-color: currentColor;
          background-image: linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.5) 0%,
            rgba(255, 255, 255, 0.5) 100%
          );
        }

        .sw label input[type="checkbox"]:checked + .lever:before,
        .sw label input[type="checkbox"]:checked + .lever:after {
          left: 18px;
        }

        .sw label input[type="checkbox"]:checked + .lever:after {
          background-color: currentColor;
        }

        .sw label .lever {
          content: "";
          display: inline-block;
          position: relative;
          width: 36px;
          height: 14px;
          background-image: linear-gradient(
            0deg,
            rgba(127, 127, 127, 0.5) 0%,
            rgba(127, 127, 127, 0.5) 100%
          );
          background-color: inherit;
          border-radius: 15px;
          margin-right: 10px;
          transition: background 0.3s ease;
          vertical-align: middle;
          margin: 0 16px;
        }

        .sw label .lever:before,
        .sw label .lever:after {
          content: "";
          position: absolute;
          display: inline-block;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          left: 0;
          top: -3px;
          transition: left 0.3s ease, background 0.3s ease, box-shadow 0.1s ease,
            transform 0.1s ease;
        }

        .sw label .lever:before {
          background-color: currentColor;
          background-image: linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.9) 100%
          );
        }

        .sw label .lever:after {
          background-color: #f1f1f1;
          box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
            0px 2px 2px 0px rgba(0, 0, 0, 0.14),
            0px 1px 5px 0px rgba(0, 0, 0, 0.12);
        }

        input[type="checkbox"]:checked:not(:disabled) ~ .lever:active::before,
        input[type="checkbox"]:checked:not(:disabled).tabbed:focus
          ~ .lever::before {
          transform: scale(2.4);
          background-color: currentColor;
          background-image: linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.9) 100%
          );
        }

        input[type="checkbox"]:not(:disabled) ~ .lever:active:before,
        input[type="checkbox"]:not(:disabled).tabbed:focus ~ .lever::before {
          transform: scale(2.4);
          background-color: rgba(0, 0, 0, 0.08);
        }

        .sw input[type="checkbox"][disabled] + .lever {
          cursor: default;
          background-color: rgba(0, 0, 0, 0.12);
        }

        .sw label input[type="checkbox"][disabled] + .lever:after,
        .sw label input[type="checkbox"][disabled]:checked + .lever:after {
          background-color: #949494;
        }
      `,
    ];
  }
}
