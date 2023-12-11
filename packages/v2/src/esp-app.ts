import { LitElement, html, css, PropertyValues, nothing } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import { classMap } from "lit-html/directives/class-map.js";
import { getBasePath } from "./esp-entity-table";

import "./esp-entity-table";
import "./esp-log";
import "./esp-switch";
import "./esp-logo";
import cssReset from "./css/reset";
import cssButton from "./css/button";
import cssApp from "./css/app";

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

  for (let t of times) {
    const segment = Math.round(Math.abs(diff / t.seconds));
    if (segment > 0)
      return new Intl.RelativeTimeFormat("en").format(
        segment * mark,
        t.type as Intl.RelativeTimeFormatUnit
      );
  }
}

@customElement("esp-app")
export default class EspApp extends LitElement {
  @state() scheme: string = "";
  @state() ping: string = "";
  @query("#beat")
  beat!: HTMLSpanElement;
  lastUpdate: number = 0;

  version: String = import.meta.env.PACKAGE_VERSION;
  config: Config = { ota: false, log: true, title: "", comment: "" };

  darkQuery: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

  frames = [
    { color: "inherit" },
    { color: "red", transform: "scale(1.25) translateY(-30%)" },
    { color: "inherit" },
  ];

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
    this.darkQuery.addEventListener("change", () => {
      this.scheme = this.isDark();
    });
    this.scheme = this.isDark();
    window.source.addEventListener("ping", (e: Event) => {
      const messageEvent = e as MessageEvent;
      const d: String = messageEvent.data;
      if (d.length) {
        this.setConfig(JSON.parse(messageEvent.data));
      }
      this.ping = messageEvent.lastEventId;
      this.requestUpdate();
    });
    window.source.addEventListener("error", (e: Event) => {
      console.dir(e);
      //console.log("Lost event stream!")
      this.ping = 0;
      this.requestUpdate();
    });
  }

  isDark() {
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
    const pingms = parseInt(this.ping);
    return `${getRelativeTime(-pingms | 0)}`;
  }

  ota() {
    if (this.config.ota) {
      let basePath = getBasePath();
      return html`<h2>OTA Update</h2>
        <form
          method="POST"
          action="${basePath}/update"
          enctype="multipart/form-data"
        >
          <input class="btn" type="file" name="update" />
          <input class="btn" type="submit" value="Update" />
        </form>`;
    }
  }

  renderLog() {
    return this.config.log
      ? html`<section class="col"><esp-log rows="50"></esp-log></section>`
      : nothing;
  }

  renderScheme() {
    if (this.config.scheme) {
      return html`<h2>
        <esp-switch
          color="var(--primary-color,currentColor)"
          class="right"
          .state="${this.scheme}"
          @state="${(e: CustomEvent) => (this.scheme = e.detail.state)}"
          labelOn="🌒"
          labelOff="☀️"
          stateOn="dark"
          stateOff="light"
          optimistic
        >
        </esp-switch>
        Scheme
      </h2>`;
    }
  }

  renderTitle() {
    return html`
      <h1>${this.config.title}</h1>
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
        <a
          href="https://esphome.io/web-api"
          class="logo"
          title="${this.version}"
        >
          <esp-logo></esp-logo>
        </a>
        <span
          id="beat"
          title="${this.version}"
          class="${classMap({ disconnected: !this.ping })}"
          >❤</span
        >
        ${this.renderTitle()}
      </header>
      <main class="flex-grid-half" @toggle-layout="${this._handleLayoutToggle}">
        <section id="col_entities" class="col">
          <esp-entity-table></esp-entity-table>
          ${this.renderScheme()} ${this.ota()}
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

  static get styles() {
    return [cssReset, cssButton, cssApp];
  }
}
