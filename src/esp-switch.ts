import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("esp-switch")
export class DebugLog extends LitElement {

  // Use arrays - or slots
  @property({ type: String }) labelOn = "On";
  @property({ type: String }) labelOff = "Off";
  @property({ type: String }) stateOn = "ON";
  @property({ type: String }) stateOff = "OFF";
  @property({ type: String }) state = "OFF";
  @property({ type: Boolean }) checked = false;

  toggle(): void {
    this.checked = !this.checked;
    this.state=this.checked ? this.stateOn : this.stateOff
    // Emit to parent...
    let event = new CustomEvent('state', { 
      detail: { state: this.state, id: this.id },
    });
    this.dispatchEvent(event);
  }

  requestUpdate(name?: PropertyKey, oldValue?: unknown) {
    if(name && name == "state" && this.state !== oldValue) {
        this.checked = this.state === this.stateOn
    }
    return super.requestUpdate(name, oldValue);
}

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("state"))
      //this.checked = this.state === this.stateOn
      console.log("now ", this.stateOn, this.checked)
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.checked = this.state === this.stateOn;
  }

  render() {
    return html`
       <div class="switch">
          <label>
          ${this.labelOff}
            <input type="checkbox" ?checked="${this.checked}" @click="${this.toggle}">
            <span style="color: #26a69a" class="lever"></span>
            ${this.labelOn}
          </label>
        </div>
    `;
  }

  static get styles() {
    return css`
.switch,
.switch * {
  -webkit-tap-highlight-color: transparent;
  user-select: none
}

.switch label {
  cursor: pointer
}

.switch label input[type=checkbox] {
  opacity: 0;
  width: 0;
  height: 0
}

.switch label input[type=checkbox]:checked+.lever {
  background-color: #84c7c1
}

.switch label input[type=checkbox]:checked+.lever:before,
.switch label input[type=checkbox]:checked+.lever:after {
  left: 18px
}

.switch label input[type=checkbox]:checked+.lever:after {
  background-color: currentColor
}

.switch label .lever {
  content: "";
  display: inline-block;
  position: relative;
  width: 36px;
  height: 14px;
  background-color: rgba(0, 0, 0, 0.38);
  border-radius: 15px;
  margin-right: 10px;
  transition: background 0.3s ease;
  vertical-align: middle;
  margin: 0 16px
}

.switch label .lever:before,
.switch label .lever:after {
  content: "";
  position: absolute;
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  left: 0;
  top: -3px;
  transition: left 0.3s ease, background .3s ease, box-shadow 0.1s ease, transform .1s ease;
}

.switch label .lever:before {
  background-color: rgba(38, 166, 154, 0.15)
}

.switch label .lever:after {
  background-color: #F1F1F1;
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)
}

input[type=checkbox]:checked:not(:disabled)~.lever:active::before,
input[type=checkbox]:checked:not(:disabled).tabbed:focus~.lever::before {
  transform: scale(2.4);
  background-color: rgba(38, 166, 154, 0.15)
}

input[type=checkbox]:not(:disabled)~.lever:active:before,
input[type=checkbox]:not(:disabled).tabbed:focus~.lever::before {
  -webkit-transform: scale(2.4);
  transform: scale(2.4);
  background-color: rgba(0, 0, 0, 0.08)
}

.switch input[type=checkbox][disabled]+.lever {
  cursor: default;
  background-color: rgba(0, 0, 0, 0.12)
}

.switch label input[type=checkbox][disabled]+.lever:after,
.switch label input[type=checkbox][disabled]:checked+.lever:after {
  background-color: #949494
}
      
    `;
  }
}
