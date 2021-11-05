import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import "./esp-entity-table";
import "./esp-log";
import "./esp-switch";

@customElement("esp-app")
export default class EspApp extends LitElement {
  static properties = {
    theme: {},
  };

  @property({ type: String }) theme = "";
  @property({ type: Boolean }) themeChecked = false;
  @property({ type: String }) ping = "";
  @property({ attribute: false }) source = new EventSource("/events");

  @query("#beat")
  beat!: HTMLSpanElement;

  frames = [{ color: "inherit" }, { color: "red", transform: "scale(1.25)" }, { color: "inherit" }];

  constructor() {
    super();
    this.source.addEventListener("ping", (e: Event) => {
      const messageEvent = e as MessageEvent;
      console.dir(messageEvent.lastEventId);
      this.ping = messageEvent.lastEventId;
    });
    this.source.onerror = function(e) {
      console.dir(e);
      //alert("Lost event stream!");
    };
  }

  toggleSwitch(): void {
    this.themeChecked = !this.themeChecked;
    this.theme = this.themeChecked ? "dark" : "light";
    // color-scheme: dark;
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("theme")) {
      let el = document.documentElement;
      el.classList.add("theme-toggle");
      el.setAttribute("data-theme", this.theme);
      document.documentElement.style.setProperty('--my-variable-name', 'pink');
      document.documentElement.style.setProperty('color-scheme', this.theme);
      window.setTimeout(() => {
        el.classList.remove("theme-toggle");
      }, 1000);
    }
    if (changedProperties.has("ping")) {
      //heartbeat here
      this.beat.animate(this.frames, 1000);
    }
  }

  render() {
    return html`
      <h1><span id="beat" style="float:right;height:1rem">❤</span><img src="https://esphome.io/_static/safari-pinned-tab.svg" style="height:3rem" /> ${document.title}</h1>
      <section>
        <esp-entity-table .source=${this.source}></esp-entity-table>

        <h2>Debug Log</h2>
        <esp-log rows="50" .source=${this.source}></esp-log>

        <esp-switch style="float:right" .state="${this.theme}" @state="${(e: CustomEvent) => (this.theme = e.detail.state)}" labelOn="Dark" labelOff="Light" stateOn="dark" stateOff="light"></esp-switch>
        <h2>OTA Update</h2>
        <form method="POST" action="/update" enctype="multipart/form-data">
          <input type="file" name="update" />
          <input type="submit" value="Update" />
        </form>
      </section>
    `;
  }

  static get styles() {
    return css`
      h1,
      h2 {
        border-bottom: 1px solid #eaecef;
      }

      html[data-theme="dark"] img {
        filter: invert(100%);
      }

      Ximg {
        background-color: yellow;
        filter: invert(100%);
      }
    `;
  }
}
