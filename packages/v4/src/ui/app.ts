// App shell: header (logo, heartbeat, layout + theme toggles, title, uptime),
// main layout (entities + log columns), OTA form and the global event
// dispatcher that turns data-* attributes into REST actions.
import { actionUrl, base, post } from "../core/api";
import { html, icon, raw } from "../core/dom";
import { emit, on, store } from "../core/store";
import { relative } from "../core/time";
import "./entities";
import "./log";

// official ESPHome logo (trademark) - build-time asset, colors preserved
import logo from "/logo.svg?raw";

const entityOf = (el: Element) =>
  store.entities.get(el.getAttribute("data-id") || "");

const setBubble = (input: HTMLInputElement): void => {
  const slw = input.closest<HTMLElement>(".slw");
  if (!slw) return;
  const lo = Number(input.min);
  const hi = Number(input.max);
  const v = Number(input.value);
  slw.style.setProperty(
    "--p",
    (hi > lo ? ((v - lo) / (hi - lo)) * 100 : 0).toFixed(2)
  );
  const bubble = slw.querySelector<HTMLElement>(".slv");
  if (bubble) bubble.textContent = String(v);
};

// One delegated listener per event type keeps the bundle small and works
// with any markup, including controls rebuilt on layout switches.
document.addEventListener("click", (ev) => {
  const b = (ev.target as HTMLElement).closest<HTMLElement>("[data-act]");
  // selects and range inputs carry data-act for their change events; only
  // buttons act on click
  if (b?.matches("button") && !b.hasAttribute("disabled")) {
    const ent = entityOf(b);
    if (ent) post(actionUrl(ent, b.dataset.act!));
  }
});

document.addEventListener("change", (ev) => {
  const t = ev.target as HTMLInputElement;
  const ent = entityOf(t);
  if (!ent) return;
  if (t.dataset.sw !== undefined) {
    post(actionUrl(ent, t.checked ? "turn_on" : "turn_off"));
  } else if (t.type === "color") {
    const v = t.value.match(/[0-9a-f]{2}/gi) || ["0", "0", "0"];
    const rgb = (i: number) => parseInt(v[i], 16);
    post(
      actionUrl(ent, t.dataset.act || "turn_on"),
      `r=${rgb(0)}&g=${rgb(1)}&b=${rgb(2)}`
    );
  } else if (t.type === "range") {
    post(`${actionUrl(ent, t.dataset.act!)}?${t.dataset.param}=${t.value}`);
  } else if (t.matches("select")) {
    post(
      `${actionUrl(ent, t.dataset.act!)}?${t.dataset.param}=${encodeURIComponent(
        t.value
      )}`
    );
  } else if (t.dataset.set !== undefined) {
    const val =
      t.type === "datetime-local" ? t.value.replace("T", " ") : t.value;
    post(
      `${actionUrl(ent, "set")}?${t.dataset.param}=${encodeURIComponent(val)}`
    );
  }
});

document.addEventListener("input", (ev) => {
  const t = ev.target as HTMLInputElement;
  if (t.type === "range") setBubble(t);
});

export class EApp extends HTMLElement {
  private unsubs: (() => void)[] = [];

  connectedCallback(): void {
    document.title = store.title || document.title;
    this.innerHTML = html`
      <header>
        <a href="https://esphome.io/web-api" id="logo" title="${import.meta.env.PACKAGE_VERSION}" aria-label="ESPHome">${raw(logo)}</a>
        <span class="hicons">
          <button class="hicon ${store.connected ? "ok" : "off"}" id="beat"></button>
          <button class="hicon" id="layout"></button>
          <button class="hicon" id="theme">${icon("theme-light-dark")}</button>
        </span>
        <h1 id="title">&nbsp;</h1>
        <div id="sub"></div>
      </header>
      <main id="main" class="${store.layout}">
        <section id="col-ent">
          <e-entities></e-entities>
          <div id="ota"></div>
        </section>
        <section id="col-log"><e-log></e-log></section>
      </main>
    `;
    this.wire();
    this.applyTheme();
  }

  private wire(): void {
    const q = <T extends HTMLElement>(s: string) => this.querySelector<T>(s)!;
    const beat = q<HTMLButtonElement>("#beat");
    const sub = q<HTMLElement>("#sub");
    const title = q<HTMLElement>("#title");
    const ota = q<HTMLElement>("#ota");
    const main = q<HTMLElement>("#main");
    const layoutBtn = q<HTMLButtonElement>("#layout");
    const themeBtn = q<HTMLButtonElement>("#theme");

    const paintBeat = () => {
      beat.className = `hicon ${store.connected ? "ok" : "off"}`;
      beat.title = `started ${relative(-store.uptime)}`;
      beat.innerHTML = icon(store.connected ? "circle" : "circle-off-outline");
    };

    const paint = () => {
      title.innerHTML = store.title || "&nbsp;";
      document.title = store.title || document.title;
      sub.textContent = [store.comment, `started ${relative(-store.uptime)}`]
        .filter(Boolean)
        .join(" · ");
      if (store.ota && !ota.childElementCount) {
        ota.innerHTML = html`<div class="sec-h">OTA Update</div>
          <form method="POST" action="${base()}/update" enctype="multipart/form-data" class="sec-b ota">
            <input class="btn" type="file" name="update" accept="application/octet-stream" />
            <input class="btn" type="submit" value="Update" />
          </form>`;
      }
      q<HTMLElement>("#col-log").style.display = store.logging ? "" : "none";
      paintBeat();
    };

    const paintLayout = () => {
      layoutBtn.innerHTML = icon(
        store.layout === "cards" ? "view-list-outline" : "view-grid-outline"
      );
      layoutBtn.title =
        store.layout === "cards" ? "Table layout" : "Card layout";
    };

    this.unsubs.push(
      on("config", paint),
      on("uptime", paint),
      on("conn", paintBeat),
      on("expand", (what: string) => {
        main.classList.toggle(
          what === "log" ? "expanded_logs" : "expanded_entity"
        );
      })
    );

    paintLayout();
    layoutBtn.addEventListener("click", () => {
      store.layout = store.layout === "cards" ? "table" : "cards";
      localStorage.setItem("e4-layout", store.layout);
      main.className = store.layout;
      paintLayout();
      emit("layout");
    });

    themeBtn.addEventListener("click", () => {
      store.theme = store.theme === "dark" ? "light" : "dark";
      localStorage.setItem("e4-theme", store.theme);
      this.applyTheme();
    });

    paint();
    paintBeat();
  }

  private applyTheme(): void {
    document.documentElement.dataset.theme = store.theme;
    (document.documentElement.style as any).colorScheme = store.theme;
  }
}

customElements.define("e-app", EApp);
