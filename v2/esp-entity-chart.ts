import { html, css, LitElement, TemplateResult, nothing } from "lit";
import { customElement, state, property } from "lit/decorators.js";
import Chart from "chart.js/auto";

const debuglog = false;

@customElement("esp-entity-chart")
export class ChartElement extends LitElement {
  @property({ type: Array }) chartdata = [];
  private chartSubComponent: Chart;

  constructor() {
    super();
  }

  updated(changedProperties: Map<string, unknown>) {
    if (debuglog) console.log("updated>", this.chartdata, changedProperties);

    super.updated(changedProperties);
    if (changedProperties.has("chartdata")) {
      this.chartSubComponent.data.datasets[0].data = this.chartdata;
      this.chartSubComponent.data.labels = this.chartdata;
      this.chartSubComponent?.update();
    }
  }

  firstUpdated() {
    if (debuglog) console.log("firstUpdated", this.chartdata);
    const ctx = this.renderRoot.querySelector("canvas").getContext("2d");
    if (debuglog) console.log(ctx);

    this.chartSubComponent = new Chart(ctx, {
      type: "line",
      data: {
        labels: this.chartdata,
        datasets: [
          {
            data: this.chartdata,
            borderWidth: 1,
            tension: 0.3
          },
        ],
      },
      options: {
        // responsive: true,
        plugins: { legend: { display: false } },
        scales: { x: { display: false }, y: { position: "right" } },
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  static get styles() {
    return css`
      :host {
        position: absolute;
        left: 24px;
        height: 42px !important;
        width: calc(100% - 42px);
        z-index: -100;
        opacity: 0.1;
      }
      :host-context(.expanded) {
        height: 240px !important;
        opacity: 0.5;
      }
    `;
  }

  render() {
    return html`<canvas></canvas>`;
  }
}
