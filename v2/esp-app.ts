import { LitElement, html, css, PropertyValues, nothing } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import { getBasePath } from "./esp-entity-table";

import "./esp-entity-table";
import "./esp-log";
import "./esp-switch";
import "./esp-logo";
import cssReset from "./css/reset";
import cssButton from "./css/button";
import cssApp from "./css/app";
import cssTab from "./css/tab";

window.source = new EventSource(getBasePath() + "/events");

interface Config {
  ota: boolean;
  log: boolean;
  title: string;
  comment: string;
}

function getRelativeTime(diff: number) {
  const mark = Math.sign(diff);

  if (diff === 0) return new Intl.RelativeTimeFormat("en").format(0, "second");

  const times = [
    { type: "year", seconds: 12 * 30 * 24 * 60 * 60 * 1000 },
    { type: "month", seconds: 30 * 24 * 60 * 60 * 1000 },
    { type: "week", seconds: 7 * 24 * 60 * 60 * 1000 },
    { type: "day", seconds: 24 * 60 * 60 * 1000 },
    { type: "hour", seconds: 60 * 60 * 1000 },
    { type: "minute", seconds: 60 * 1000 },
    { type: "second", seconds: 1000 },
  ];

  let result = "";
  const timeformat = new Intl.RelativeTimeFormat("en");
  let count = 0;
  for (let t of times) {
    const segment = Math.trunc(Math.abs(diff / t.seconds));
    if (segment > 0) {
      const part = timeformat.format(
        segment * mark,
        t.type as Intl.RelativeTimeFormatUnit
      );
      diff -= segment * t.seconds * mark;
      // remove "ago" from the first segment - if not the only one
      result +=
        count === 0 && t.type != "second" ? part.replace(" ago", " ") : part;
      if (count++ >= 1) break; // do not display detail after two segments
    }
  }
  return result;
}

@customElement("esp-app")
export default class EspApp extends LitElement {
  @state() scheme: string = "";
  @state() ping: number = 0;
  @state() connected: boolean = true;
  @state() lastUpdate: number = 0;
  @query("#beat")
  beat!: HTMLSpanElement;

  version: String = import.meta.env.PACKAGE_VERSION;
  config: Config = { ota: false, log: true, title: "", comment: "" };

  darkQuery: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

  frames = [{}, { color: "red", transform: "scale(1.25)" }, {}];

  constructor() {
    super();
    const conf = document.querySelector("script#config");
    if (conf) this.setConfig(JSON.parse(conf.innerText));
  }

  setConfig(config: any) {
    if (!("log" in config)) {
      config.log = this.config.log;
    }
    this.config = config;

    document.title = config.title;
    document.documentElement.lang = config.lang;
  }

  firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    document.getElementsByTagName("head")[0].innerHTML +=
      '<meta name=viewport content="width=device-width, initial-scale=1,user-scalable=no">';
    const l = <HTMLLinkElement>document.querySelector("link[rel~='icon']"); // Set favicon to house
    l.href =
      'data:image/svg+xml,<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg"><style>path{stroke-width:1;fill:black;stroke:black;stroke-linecap:round;stroke-linejoin:round}@media (prefers-color-scheme:dark){path{fill:white;stroke:white}}</style><path d="M1.3 18H5v10h21.8V18h3.7l-3.7-3.7V7.8h-2.4V12l-8.7-8.7L1.3 18Z"/></svg>';
    this.scheme = this.schemeDefault();
    window.source.addEventListener("ping", (e: MessageEvent) => {
      if (e.data?.length) {
        this.setConfig(JSON.parse(e.data));
        this.requestUpdate();
      }
      this._updateUptime(e);
      this.lastUpdate = Date.now();
    });
    window.source.addEventListener("log", (e: MessageEvent) => {
      this._updateUptime(e);
      this.lastUpdate = Date.now();
    });
    window.source.addEventListener("state", (e: MessageEvent) => {
      this.lastUpdate = Date.now();
    });
    window.source.addEventListener("error", (e: Event) => {
      console.dir(e);
      //console.log("Lost event stream!")
      this.connected = false;
      this.requestUpdate();
    });
    setInterval(() => {
      this.connected = !!this.ping && Date.now() - this.lastUpdate < 15000;
    }, 5000);
  }

  schemeDefault() {
    return this.darkQuery.matches ? "dark" : "light";
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has("scheme")) {
      let el = document.documentElement;
      document.documentElement.style.setProperty("color-scheme", this.scheme);
    }
    if (changedProperties.has("ping")) {
      if (!!this.ping) this.beat.animate(this.frames, 1000);
    }
  }

  uptime() {
    return `${getRelativeTime(-this.ping | 0)}`;
  }

  renderOta() {
    if (this.config.ota) {
      let basePath = getBasePath();
      return html`<div class="tab-header">OTA Update</div>
        <form
          method="POST"
          action="${basePath}/update"
          enctype="multipart/form-data"
          class="tab-container"
        >
          <input class="btn" type="file" name="update" />
          <input class="btn" type="submit" value="Update" />
        </form>`;
    }
  }

  renderLog() {
    return this.config.log
      ? html`<section class="col">
          <esp-log rows="50" .scheme="${this.scheme}"></esp-log>
        </section>`
      : nothing;
  }

  renderTitle() {
    return html`
      <h1>${this.config.title || html`&nbsp;`}</h1>
      <div>
        ${[this.config.comment, `started ${this.uptime()}`]
          .filter((n) => n)
          .map((e) => `${e}`)
          .join(" · ")}
      </div>
    `;
  }

  render() {
    return html`
      <header>
        <a href="https://esphome.io/web-api" id="logo" title="${this.version}">
          <esp-logo></esp-logo>
        </a>
        <iconify-icon
          .icon="${!!this.connected ? "mdi:heart" : "mdi:heart-off"}"
          .title="${this.uptime()}"
          class="top-icon"
          id="beat"
        ></iconify-icon>
        <a
          href="#"
          id="scheme"
          @click="${() => {
            this.scheme = this.scheme !== "dark" ? "dark" : "light";
          }}"
        >
          <iconify-icon
            icon="mdi:theme-light-dark"
            class="top-icon"
          ></iconify-icon>
        </a>
        ${this.renderTitle()}
      </header>
      <main class="flex-grid-half" @toggle-layout="${this._handleLayoutToggle}">
        <section id="col_entities" class="col">
          <esp-entity-table .scheme="${this.scheme}"></esp-entity-table>
          ${this.renderOta()}
        </section>
        ${this.renderLog()}
      </main>
    `;
  }

  _handleLayoutToggle(e: Event) {
    e.currentTarget?.classList.toggle(
      "expanded_entity",
      e.detail === "entity-table" ? undefined : false
    );
    e.currentTarget?.classList.toggle(
      "expanded_logs",
      e.detail === "logs-table" ? undefined : false
    );
  }

  private _updateUptime(e: MessageEvent) {
    if (e.lastEventId) {
      this.ping = parseInt(e.lastEventId);
      this.connected = true;
      this.requestUpdate();
    }
  }

  static get styles() {
    return [cssReset, cssButton, cssApp, cssTab];
  }
}
