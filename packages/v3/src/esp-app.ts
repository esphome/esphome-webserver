import { LitElement, html, PropertyValues, nothing } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import { getBasePath } from "./esp-entity-table";

import "./esp-entity-table";
import "./esp-log";
import "./esp-switch";
import "./esp-range-slider";
import "./esp-logo";
import "iconify-icon";
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
  lang?: string;
}

function getRelativeTime(diff: number) {
  const mark = Math.sign(diff);

  if (diff === 0) return new Intl.RelativeTimeFormat("en").format(0, "second");

  const times = [
    { type: "year", ms: 12 * 30 * 24 * 60 * 60 * 1000 },
    { type: "month", ms: 30 * 24 * 60 * 60 * 1000 },
    { type: "week", ms: 7 * 24 * 60 * 60 * 1000 },
    { type: "day", ms: 24 * 60 * 60 * 1000 },
    { type: "hour", ms: 60 * 60 * 1000 },
    { type: "minute", ms: 60 * 1000 },
    { type: "second", ms: 1000 },
  ];

  let result = "";
  const timeformat = new Intl.RelativeTimeFormat("en");
  let count = 0;
  for (let t of times) {
    const segment = Math.trunc(Math.abs(diff / t.ms));
    if (segment > 0) {
      const part = timeformat.format(
        segment * mark,
        t.type as Intl.RelativeTimeFormatUnit
      );
      diff -= segment * t.ms * mark;
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
  private _hasJsonUptime: boolean = false;
  private _connectionTimer?: ReturnType<typeof setInterval>;
  @query("#beat")
  beat!: HTMLSpanElement;

  version: String = import.meta.env.PACKAGE_VERSION;
  config: Config = { ota: false, log: true, title: "", comment: "" };

  darkQuery: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

  frames = [{}, { color: "rgba(0, 196, 21, 0.75)" }, {}];

  private _handleEntityTabDblClick = () => {
    const mainElement = this.shadowRoot?.querySelector("main.flex-grid-half");
    mainElement?.classList.toggle("expanded_entity");
  };

  private _handleLogTabDblClick = () => {
    const mainElement = this.shadowRoot?.querySelector("main.flex-grid-half");
    mainElement?.classList.toggle("expanded_logs");
  };

  constructor() {
    super();
    const conf = document.querySelector("script#config")?.textContent;
    if (conf) this.setConfig(JSON.parse(conf));
  }

  setConfig(config: any) {
    if (!("log" in config)) {
      config.log = this.config.log;
    }
    this.config = config;

    document.title = config.title;
    if (config.lang) document.documentElement.lang = config.lang;
  }

  firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1,user-scalable=no";
    document.head.appendChild(meta);
    const l = <HTMLLinkElement>document.querySelector("link[rel~='icon']"); // Set favicon to house
    if (l) {
      l.href =
        'data:image/svg+xml,<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg"><style>path{stroke-width:1;fill:black;stroke:black;stroke-linecap:round;stroke-linejoin:round}@media (prefers-color-scheme:dark){path{fill:white;stroke:white}}</style><path d="M1.3 18H5v10h21.8V18h3.7l-3.7-3.7V7.8h-2.4V12l-8.7-8.7L1.3 18Z"/></svg>';
    }
    this.scheme = this.schemeDefault();
    window.source.addEventListener("ping", (e: MessageEvent) => {
      if (e.data?.length) {
        const data = JSON.parse(e.data);
        if (data.title !== undefined) {
          // Full config: {"title":"...","comment":"...","ota":true,"log":true,"lang":"en","uptime":123456}
          this.setConfig(data);
          this.requestUpdate();
        }
        if (data.uptime !== undefined) {
          // New firmware sends uptime in seconds in JSON data (overflow-safe)
          // Full config (on connect): {"title":"...","uptime":123456}
          // Interval ping: {"uptime":123456}
          this._hasJsonUptime = true;
          this._setUptime(data.uptime * 1000);
        } else {
          // Old firmware sends uptime in lastEventId (32-bit, may overflow after ~49 days)
          this._updateUptime(e);
        }
      } else {
        // Old firmware interval ping: empty data, uptime in lastEventId
        this._updateUptime(e);
      }
      this.lastUpdate = Date.now();
    });
    window.source.addEventListener("log", (e: MessageEvent) => {
      // Old firmware sends uptime in lastEventId for log events
      // Skip when new firmware provides uptime via JSON ping to avoid
      // millis() overwriting the overflow-safe seconds-based value
      if (!this._hasJsonUptime) {
        this._updateUptime(e);
      }
      this.lastUpdate = Date.now();
    });
    window.source.addEventListener("state", (e: MessageEvent) => {
      this.lastUpdate = Date.now();
    });
    window.source.addEventListener("error", () => {
      // EventSource reconnects on its own; just reflect the drop in the UI
      this.connected = false;
      this.requestUpdate();
    });
    this._connectionTimer = setInterval(() => {
      this.connected = !!this.ping && Date.now() - this.lastUpdate < 15000;
    }, 5000);
    document.addEventListener(
      "entity-tab-header-double-clicked",
      this._handleEntityTabDblClick
    );
    document.addEventListener(
      "log-tab-header-double-clicked",
      this._handleLogTabDblClick
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._connectionTimer !== undefined) clearInterval(this._connectionTimer);
    document.removeEventListener(
      "entity-tab-header-double-clicked",
      this._handleEntityTabDblClick
    );
    document.removeEventListener(
      "log-tab-header-double-clicked",
      this._handleLogTabDblClick
    );
  }

  schemeDefault() {
    return this.darkQuery.matches ? "dark" : "light";
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has("scheme")) {
      document.documentElement.style.setProperty("color-scheme", this.scheme);
    }
    if (changedProperties.has("ping")) {
      if (!!this.ping) this.beat.animate(this.frames, 1000);
    }
  }

  uptime() {
    return `${getRelativeTime(-this.ping || 0)}`;
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
          <input class="btn" type="file" name="update" accept="application/octet-stream" />
          <input class="btn" type="submit" value="Update" />
        </form>`;
    }
  }

  renderLog() {
    return this.config.log
      ? html`<section
          id="col_logs"
          class="col"
        >
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
          .join(" · ")}
      </div>
    `;
  }

  render() {
    return html`
      <header>
        <a href="https://esphome.io/web-api" id="logo" title="${this.version}">
          <esp-logo style="width: 52px; height: 40px;"></esp-logo>
        </a>
        <iconify-icon
          .icon="${!!this.connected ? "mdi:circle" : "mdi:circle-off-outline"}"
          .title="${this.uptime()}"
          class="top-icon ${!!this.connected ? "connected" : ""}"
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
      <main class="flex-grid-half">
        <section
          id="col_entities"
          class="col"          
        >
          <esp-entity-table .scheme="${this.scheme}"></esp-entity-table>
          ${this.renderOta()}
        </section>
        ${this.renderLog()}
      </main>
    `;
  }

  private _setUptime(uptime: number) {
    this.ping = uptime;
    this.connected = true;
    this.requestUpdate();
  }

  private _updateUptime(e: MessageEvent) {
    if (e.lastEventId) {
      this._setUptime(parseInt(e.lastEventId));
    }
  }

  static get styles() {
    return [cssReset, cssButton, cssApp, cssTab];
  }
}
