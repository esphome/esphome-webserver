// One element per entity. Builds its DOM once (row or card depending on the
// layout), then patches values in place on state events - inputs never lose
// focus and there is no list reconciliation.
import { icon, html } from "../core/dom";
import { DOMAIN_ICON, on, store, type Entity } from "../core/store";
import { controlHtml, patchControl } from "./controls";

export class EEntity extends HTMLElement {
  ent!: Entity;
  private refs: Record<string, any> = {};
  private unsubs: (() => void)[] = [];

  connectedCallback(): void {
    this.unsubs.push(
      on("state", (e: Entity) => e === this.ent && this.patch()),
      on("layout", () => this.build())
    );
    if (this.ent) this.build();
  }

  disconnectedCallback(): void {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
  }

  set entity(e: Entity) {
    this.ent = e;
    if (this.isConnected) this.build();
  }

  private iconFor(): string {
    const e = this.ent;
    if (e.domain === "binary_sensor")
      return e.state === "ON"
        ? "checkbox-marked-circle"
        : "checkbox-blank-circle-outline";
    return e.icon || DOMAIN_ICON[e.domain] || "information-outline";
  }

  private valueHtml(): string {
    return this.ent.has_action
      ? controlHtml(this.ent)
      : html`<div class="st">${this.ent.state}</div>`;
  }

  private build(): void {
    const e = this.ent;
    this.className = `ent${e.domain === "sensor" ? " sensor" : ""}${
      e.is_disabled_by_default && !store.showAll ? " dim" : ""
    }`;
    this.innerHTML = html`
      <div class="eic">${icon(this.iconFor())}</div>
      <div class="ename">${e.device ? `[${e.device}] ` : ""}${e.name}</div>
      <div class="eval">${this.valueHtml()}</div>
      ${e.domain === "sensor" ? html`<e-chart class="spark"></e-chart>` : html``}
    `;
    this.refs.val = this.querySelector<HTMLElement>(".eval")!;
    this.refs.ic = this.querySelector<HTMLElement>(".eic")!;
    this.refs.chart = this.querySelector("e-chart") as any;
    if (this.refs.chart) this.refs.chart.series = e.hist;
  }

  private patch(): void {
    const e = this.ent;
    this.classList.toggle("dim", !!e.is_disabled_by_default && !store.showAll);
    if (e.domain === "binary_sensor") {
      this.refs.ic.innerHTML = icon(this.iconFor()).toString();
    }
    if (e.has_action) {
      patchControl(e, this.refs.val);
    } else {
      const st = this.refs.val.firstElementChild as HTMLElement | null;
      if (st) st.textContent = e.state;
    }
    if (this.refs.chart) this.refs.chart.series = e.hist;
  }
}

customElements.define("e-entity", EEntity);

// Click on a sensor row/card expands the chart (ctrl-click forces expand,
// plain click toggles - same behaviour as v3).
document.addEventListener("click", (ev) => {
  const el = (ev.target as HTMLElement).closest<HTMLElement>(".ent.sensor");
  if (!el || (ev.target as HTMLElement).closest("button,input,select,a")) return;
  if (!ev.ctrlKey) ev.stopPropagation();
  el.classList.toggle("expanded", ev.ctrlKey ? true : undefined);
});
