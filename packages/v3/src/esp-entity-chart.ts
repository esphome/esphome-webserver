import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

// Viewport is a fixed 0..100 box scaled to the host with preserveAspectRatio="none".
// The line is inset vertically so the stroke is not clipped at the extremes.
const TOP = 4;
const BOTTOM = 96;

@customElement("esp-entity-chart")
export class ChartElement extends LitElement {
  @property({ type: Array }) chartdata: number[] = [];

  private _observer?: MutationObserver;

  connectedCallback() {
    super.connectedCallback();
    this._applyExpandedStyles();
    const parent = this.parentElement;
    if (parent) {
      this._observer = new MutationObserver(() => this._applyExpandedStyles());
      this._observer.observe(parent, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }

  disconnectedCallback() {
    this._observer?.disconnect();
    this._observer = undefined;
    super.disconnectedCallback();
  }

  // since the :host-context(.expanded) selector is not supported in Safari and Firefox we need to use JS to apply styles
  // whether the parent element is expanded or not
  private _applyExpandedStyles() {
    const expanded = this.parentElement?.classList.contains("expanded");
    this.style.height = expanded ? "240px" : "42px";
    this.style.opacity = expanded ? "0.5" : "0.1";
  }

  // The history is seeded with an unguarded `data.value` (esp-entity-table only
  // typechecks on append), so element 0 can be null or a string. Number.isFinite
  // does not coerce, so those are dropped instead of becoming spurious 0 points.
  private _values(): number[] {
    return (this.chartdata || []).filter(Number.isFinite);
  }

  private _points(values: number[]): string {
    if (values.length === 0) return "";
    const min = Math.min(...values);
    const span = Math.max(...values) - min;
    const step = values.length > 1 ? 100 / (values.length - 1) : 0;
    return values
      .map((v, i) => {
        const x = values.length > 1 ? i * step : 50;
        const y = span > 0 ? BOTTOM - ((v - min) / span) * (BOTTOM - TOP) : 50;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }

  // Axis labels are raw sensor readings, so trim them to something readable
  // rather than printing the full float.
  private _label(value: number | undefined) {
    return value === undefined ? "" : Number(value.toPrecision(4));
  }

  render() {
    const values = this._values();
    const min = this._label(values.length ? Math.min(...values) : undefined);
    const max = this._label(values.length ? Math.max(...values) : undefined);
    return html`
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points="${this._points(values)}"
          vector-effect="non-scaling-stroke"
        ></polyline>
      </svg>
      <div class="axis">
        <span>${max}</span>
        <span>${min}</span>
      </div>
    `;
  }

  static get styles() {
    return css`
      :host {
        position: absolute;
        left: 24px;
        height: 42px;
        width: calc(100% - 42px);
        z-index: -100;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
      }
      polyline {
        fill: none;
        stroke: var(--primary-color, #03a9f4);
        stroke-width: 1;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .axis {
        position: absolute;
        top: 0;
        right: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-end;
        font-size: 10px;
        line-height: 1;
        pointer-events: none;
      }
    `;
  }
}
