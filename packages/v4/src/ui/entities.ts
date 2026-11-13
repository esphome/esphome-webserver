// Manages group sections and the e-entity elements inside them. Sections are
// created on demand, ordered by sorting_group weight; entities are inserted
// sorted by (sorting_weight, name). Never drops an unannounced group.
import { html } from "../core/dom";
import { emit, on, store, type Entity } from "../core/store";
import type { EEntity } from "./entity";

export class EEntities extends HTMLElement {
  private sections = new Map<string, { sec: HTMLElement; body: HTMLElement }>();
  private unsubs: (() => void)[] = [];
  private allBtn?: HTMLButtonElement;

  connectedCallback(): void {
    this.innerHTML = html`
      <div id="groups"></div>
      <div class="allrow">
        <button class="btn all" hidden>Show All</button>
      </div>
    `;
    this.allBtn = this.querySelector<HTMLButtonElement>(".all")!;
    this.allBtn.addEventListener("click", () => {
      store.showAll = true;
      this.querySelectorAll<HTMLElement>(".ent.dim").forEach((el) =>
        el.classList.remove("dim")
      );
      this.allBtn!.hidden = true;
    });
    this.unsubs.push(
      on("entity", (e: Entity) => this.add(e)),
      on("groups", () => this.order())
    );
  }

  disconnectedCallback(): void {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
  }

  private add(e: Entity): void {
    const name = e.sorting_group;
    let s = this.sections.get(name);
    if (!s) {
      const sec = document.createElement("section");
      sec.className = "sec";
      sec.innerHTML = html`<div class="sec-h">${name}</div><div class="sec-b"></div>`;
      this.querySelector("#groups")!.append(sec);
      s = { sec, body: sec.querySelector<HTMLElement>(".sec-b")! };
      this.sections.set(name, s);
    }
    const el = document.createElement("e-entity") as EEntity;
    el.entity = e;
    // sorted insert: by sorting_weight, then name
    const kids = [...s.body.children] as (HTMLElement & { ent?: Entity })[];
    const w = e.sorting_weight ?? Number.MAX_SAFE_INTEGER;
    const nm = e.name.toLowerCase();
    const before = kids.find((k) => {
      const o = k.ent!;
      const ow = o.sorting_weight ?? Number.MAX_SAFE_INTEGER;
      return ow > w || (ow === w && o.name.toLowerCase() > nm);
    });
    s.body.insertBefore(el, before ?? null);
    this.order();
    this.checkAll();
  }

  private order(): void {
    const groups = this.querySelector<HTMLElement>("#groups")!;
    const done = new Set<string>();
    for (const g of store.groups) {
      const s = this.sections.get(g.name);
      if (s) {
        groups.append(s.sec);
        done.add(g.name);
      }
    }
    for (const [name, s] of this.sections) {
      if (!done.has(name)) groups.append(s.sec);
    }
  }

  private checkAll(): void {
    if (!this.allBtn) return;
    this.allBtn.hidden = store.showAll || !store.entities.size ||
      ![...store.entities.values()].some((e) => e.is_disabled_by_default);
  }
}

customElements.define("e-entities", EEntities);

// double click on a section header expands/collapses the entity column
document.addEventListener("dblclick", (ev) => {
  const h = (ev.target as HTMLElement).closest<HTMLElement>("#col-ent .sec-h");
  if (h) emit("expand", "entity");
});
