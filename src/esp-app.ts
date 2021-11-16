import { LitElement, html, svg, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import "./esp-entity-table";
import "./esp-log";
import "./esp-switch";
import "./esp-logo";
import cssReset from "./css/reset";
import cssButton from "./css/button";

@customElement("esp-app")
export default class EspApp extends LitElement {
  static properties = {
    scheme: {},
  };

  @property({ type: String }) scheme = "";
  @property({ type: String }) version = import.meta.env.PACKAGE_VERSION;
  @property({ type: Boolean }) schemeChecked = false;
  @property({ type: String }) ping = "";
  @property({ type: Object }) config = { ota: false, title: "" };
  @property({ attribute: false }) source = new EventSource("/events");

  @query("#beat")
  beat!: HTMLSpanElement;

  darkQuery: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

  frames = [{ color: "inherit" }, { color: "red", transform: "scale(1.25) translateY(-30%)" }, { color: "inherit" }];

  constructor() {
    super();
    document.getElementsByTagName("head")[0].innerHTML += '<meta charset=UTF-8><meta name=viewport content="width=device-width, initial-scale=1,user-scalable=no">';
    const l = <HTMLLinkElement>document.querySelector("link[rel~='icon']"); // Set favicon to house
    l.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width=22 height=22><path d="M0 11.5h2.9v7.8h17v-7.8h2.9l-2.9-2.9V3.5h-1.8v3.3L11.3 0Z"/></svg>';
    this.darkQuery.addEventListener("change", () => {
      this.scheme = this.isDark();
    });
    this.scheme = this.isDark();
    this.source.addEventListener("ping", (e: Event) => {
      const messageEvent = e as MessageEvent;
      const d: String = messageEvent.data;
      if (d.length) {
        const config = JSON.parse(messageEvent.data);
        this.config = config;
        
        document.title = config.title;
        document.documentElement.lang=config.lang;
      }
      this.ping = messageEvent.lastEventId;
    });
    this.source.onerror = function (e) {
      console.dir(e);
      //alert("Lost event stream!");
    };
  }

  isDark() {
    let r = this.darkQuery.matches ? "dark" : "light";
    return r;
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("scheme")) {
      let el = document.documentElement;
      document.documentElement.style.setProperty("color-scheme", this.scheme);
    }
    if (changedProperties.has("ping")) {
      this.beat.animate(this.frames, 1000);
    }
  }

  ota() {
    if (this.config.ota)
      return html`<h2>OTA Update</h2>
        <form method="POST" action="/update" enctype="multipart/form-data">
          <input class="btn" type="file" name="update" />
          <input class="btn" type="submit" value="Update" />
        </form>`;
  }

  render() {
    return html`
      <h1>
        <a href="https://esphome.io/web-api" style="height:4rem;float:left;color:inherit">
          <esp-logo></esp-logo>
        </a>
        ${this.config.title}
        <span id="beat" style="float:right;height:1rem" title="${this.version}">❤</span>
      </h1>
      <main class="flex-grid-half">
        <section class="col">
          <esp-entity-table .source=${this.source}></esp-entity-table>
          <h2>
            <esp-switch color="var(--primary-color,currentColor)" style="float:right" .state="${this.scheme}" @state="${(e: CustomEvent) => (this.scheme = e.detail.state)}" labelOn="🌒" labelOff="☀️" stateOn="dark" stateOff="light"> </esp-switch>
            Scheme
          </h2>
          ${this.ota()}
        </section>
        <section class="col">
          <esp-log rows="50" .source=${this.source}></esp-log>
        </section>
      </main>
    `;
  }

  static get styles() {
    return [
      cssReset,
      cssButton,
      css`
        .flex-grid {
          display: flex;
        }
        .flex-grid .col {
          flex: 2;
        }
        .flex-grid-half {
          display: flex;
          justify-content: space-evenly;
        }
        .col {
          width: 48%;
        }

        @media (max-width: 600px) {
          .flex-grid,
          .flex-grid-half {
            display: block;
          }
          .col {
            width: 100%;
            margin: 0 0 10px 0;
          }
        }

        * {
          box-sizing: border-box;
        }
        .flex-grid {
          margin: 0 0 20px 0;
        }
        h1 {
          text-align: center;
          width: 100%;
          line-height: 4rem;
        }
        h1,
        h2 {
          border-bottom: 1px solid #eaecef;
          margin-bottom: 0.25rem;
        }
      `,
    ];
  }
}
