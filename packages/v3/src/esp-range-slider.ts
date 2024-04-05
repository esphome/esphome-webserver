import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { stateOn, stateOff } from "./esp-entity-table";
import cssReset from "./css/reset";

const inputRangeID: string = "range";
const inputRangeTooltipID: string = "rangeValue";

@customElement("esp-range-slider")
export class EspRangeSlider extends LitElement {
  private inputRange: HTMLInputElement | null = null;
  private inputRangeTooltip: HTMLInputElement | null = null;

  private numDecimalPlaces: number = 0;

  @property({ type: Number }) value = 0;
  @property({ type: Number }) min = 0;
  @property({ type: Number }) max = 0;
  @property({ type: Number }) step = 0;
  @property({ type: String }) name = "";

  protected firstUpdated(
    _changedProperties: Map<string | number | symbol, unknown>
  ): void {
    this.inputRange = this.shadowRoot?.getElementById(
      inputRangeID
    ) as HTMLInputElement;

    this.inputRangeTooltip = this.shadowRoot?.getElementById(
      inputRangeTooltipID
    ) as HTMLInputElement;
  
    const val = Number(this.value);
    let stepString = this.step.toString();
    if (stepString.indexOf('.') !== -1) {
      this.numDecimalPlaces = stepString.split('.')[1].length;
    }
  
    this.updateTooltip();
  }  

  updateTooltip(): void {
    const newValueAsPercent = Number( (this.inputRange.value - this.inputRange.min) * 100 / (this.inputRange.max - this.inputRange.min) ),
    newPosition = 10 - (newValueAsPercent * 0.2);
    this.inputRangeTooltip.innerHTML = `<span>${Number(this.inputRange.value).toFixed(this.numDecimalPlaces)}</span>`;
    this.inputRangeTooltip.style.left = `calc(${newValueAsPercent}% + (${newPosition}px))`;
  }

  onInputEvent(ev: Event): void {
    this.updateTooltip();
  }

  sendState(ev: Event): void {
    let event = new CustomEvent("state", {
      detail: {
        state: Number(this.inputRange.value),
        id: this.id,
      },
    });
    this.dispatchEvent(event);
  }

  render() {
    return html`
      <div class="range-wrap">
        <label style="text-aligne: left;">${this.min || 0}</label>
        <div class="slider-wrap">
          <div class="range-value" id="rangeValue"></div>
            <input
              id="${inputRangeID}"
              type="range"
              name="${this.name}"
              step="${this.step}"
              min="${this.min || Math.min(0, this.value)}"
              max="${this.max || Math.max(10, this.value)}"
              .value="${(this.value.toFixed(this.numDecimalPlaces))}"
              @input="${this.updateTooltip}"
              @change="${this.sendState}"
            />
        </div>
        <label style="text-align: left;">${this.max || 100}</label>
      </div>
    `;
  }

  static get styles() {
    return [
      cssReset,
      css`
        :host {
          width: 100%;
        }
        input[type=range] {
          -webkit-appearance: none;
          margin: 20px 0;
          width: 100%;
        }
        input[type=range]:focus {
          outline: none;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          animate: 0.2s;
          background: #03a9f4;
          border-radius: 25px;
        }
        input[type=range]::-webkit-slider-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 0 4px 0 rgba(0,0,0, 1);
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -8px;
        }
        input[type=range]:focus::-webkit-slider-runnable-track {
          background: #03a9f4;
        }
        .range-wrap{
          display: flex;
          //position: relative;
        }
        .range-wrap label{
          flex: 1;
        }
        .slider-wrap{
          width: 70%; 
          margin: 0px 15px;
          position: relative;
        }
        .range-value{
          position: absolute;
          top: -50%;
        }
        .range-value span{
          pointer-events: none;
          padding: 0 3px 0 3px;
          height: 19px;
          line-height: 18px;
          text-align: center;
          background: #03a9f4;
          color: #fff;
          font-size: 11px;
          display: block;
          position: absolute;
          left: 50%;
          transform: translate(-50%, +80%);
          border-radius: 6px;
        }
        .range-value span:before{
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          border-top: 10px solid #03a9f4;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          top: 100%;
          left: 50%;
          margin-left: -5px;
          margin-top: -1px;
        }
      `,
    ];
  }
}
