import { LitElement, html, svg, css } from "lit"
import { customElement, property, query } from "lit/decorators.js"

import "./esp-entity-table"
import "./esp-log"
import "./esp-switch"
import "./esp-logo"

@customElement("esp-app")
export default class EspApp extends LitElement {
  static properties = {
    scheme: {},
  };

  @property({ type: String }) scheme = "";
  @property({ type: Boolean }) schemeChecked = false;
  @property({ type: String }) ping = "";
  @property({ attribute: false }) source = new EventSource("/events");

  @query("#beat")
  beat!: HTMLSpanElement;

  darkQuery: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')

  frames = [{ color: "inherit" }, { color: "red",transform: "scale(1.25) translateY(-30%)"}, { color: "inherit" }];

  constructor() {
    super();
    this.darkQuery.addEventListener( "change", () => {
      this.scheme=this.isDark();
    });
    this.scheme=this.isDark();
    this.source.addEventListener("ping", (e: Event) => {
      const messageEvent = e as MessageEvent;
      this.ping = messageEvent.lastEventId;
    });
    this.source.onerror = function(e) {
      console.dir(e);
      //alert("Lost event stream!");
    };
  }

  isDark() {
    let r=this.darkQuery.matches ? 'dark':'light';
    return r;
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("scheme")) {
      let el = document.documentElement;
      document.documentElement.style.setProperty('color-scheme', this.scheme);
    }
    if (changedProperties.has("ping")) {
      this.beat.animate(this.frames, 1000);
    }
  }

  render() {
     return html`
     <style>
       button {
        cursor: pointer;
        }
     </style>
      <h1>
      <a href="https://esphome.io/web-api" style="width:6rem;height:4rem;float:left;color:inherit" />
      <esp-logo></esp-logo>
      </a> 
      ${document.title}
      <span id="beat" style="float:right;height:1rem">❤</span></h1>
      <section>
        <esp-entity-table .source=${this.source}></esp-entity-table>

        <h2>Debug Log</h2>
        <esp-log rows="50" .source=${this.source}></esp-log>

        <h2><esp-switch color="var(--c-primary,currentColor)" style="float:right" .state="${this.scheme}" @state="${(e: CustomEvent) => (this.scheme = e.detail.state)}" labelOn="🌒" labelOff="☀️" stateOn="dark" stateOff="light"></esp-switch>
        OTA Update</h2>
        <form method="POST" action="/update" enctype="multipart/form-data">
          <input type="file" name="update" />
          <input type="submit" value="Update" />
        </form>
      </section>
    `;
  }

  static get styles() {
    return css`
      h1 {text-align: center;width:100%;line-height:4rem}
      h1,
      h2 {
        border-bottom: 1px solid #eaecef;
      }

      html {
        button {
        cursor: pointer;
        }
      }
    `;
  }
}
