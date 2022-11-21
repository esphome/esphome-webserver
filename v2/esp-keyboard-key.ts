import { LitElement, html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";


const pressedStyle = html`
<style> :host .key {
  outline: 1px solid #333333;
  background-color: #8f8f8f !important;
} </style>`;

@customElement("keyboard-key")
export default class EspKey extends LitElement {
  @property()
  modifier = false;
  @property()
  pressed = false;
  @property()
  code = ''
  @property()
  'use-code'=false

  constructor() {
    super();
    this.addEventListener("click", (evt) => {
      this.togglePressedState();

      // Don't send event if click removed "pressed" state
      // on a modifier key.
      if (!this.modifier || this.pressed) {
        this.dispatchEvent(
          new CustomEvent("keyclick", {
            detail: {
              key: this.key,
              code: this.code,
              isModifier: this.modifier,
            },
            bubbles: true,
            composed: true,
          })
        );
      } else {
        this.dispatchEvent(
          new CustomEvent("keyrelease", {
            detail: {
              key: this.key,
              code: this.code,
            },
            bubbles: true,
            composed: true,
          })
        );
      }
    });
  }

  get key() {
    const bottomLabel = this.querySelector("[slot=bottom]")

    if (bottomLabel) {
      return bottomLabel.innerHTML;
    }

    if (this['use-code']) {
      return this.code;
    }

    const keyLabel = this.firstChild?.textContent;
    // If the key is a single A-Z character, return the lowercase
    // version.
    if (keyLabel && /^[A-Z]$/.test(keyLabel)) {
      return keyLabel.toLowerCase();
    }
    return keyLabel;
  }

  set press(newValue : boolean) {
    // Only modifier keys can be "pressed".
    if (this.modifier) {
      this.pressed = newValue;
    }
  }
  
  togglePressedState() {
    this.press = !this.pressed;
  }

  render() {
    return html`
      ${this.pressed && pressedStyle || nothing }
      <button type="button" class="key">
        <span class="content-top">
          <!-- default slot -->
          <slot></slot>
        </span>
        <span class="content-bottom">
          <slot name="bottom"></slot>
        </span>
      </button>`;
  }

  static get styles() {
    return [
      css`
      .key {
        position: relative;
        display: block;
        float: left;
        width: 50px;
        height: 50px;
        font-size: 12px;
        background-color: #fff;
        line-height: 16px;
        border-radius: 2px;
        margin: 1px;
        padding: 1px;
        cursor: pointer;
        border: 1px solid rgb(187, 187, 187);
        text-align: left;
        transition: background-color 0.25s;
      }
  
      .key:hover {
        background-color: #e3e3e3;
      }
  
      .key:active {
        background-color: #8f8f8f;
      }
    
      .key .content-top {
        position: absolute;
        top: 5px;
        left: 5px;
      }
  
      .key .content-bottom {
        position: absolute;
        bottom: 5px;
        left: 5px;
      }
  
      :host(.hidden) .key {
        visibility: hidden;
      }
  
      :host(.accented) .key {
        background-color: #dbdbdb;
      }

      :host(.accented) .key:hover {
        background-color: #b5b5b5;
      }
  
      :host(.key-collapse-half) .key {
        width: 24px;
      }
  
      :host(.key-extend-half) .key {
        width: 77px;
      }
  
      :host(.key-extend-full) .key {
        width: 102px;
      }
  
      :host(.key-extend-full-half) .key {
        width: 128px;
      }
  
      :host(.key-space) .key {
        width: 229px;
      }`,
    ]
  }

}
