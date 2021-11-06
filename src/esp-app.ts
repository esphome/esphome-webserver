import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import {unsafeHTML} from 'lit-html/directives/unsafe-html.js';

import "./esp-entity-table";
import "./esp-log";
import "./esp-switch";
import logo from "/logo.svg?raw";

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

  frames = [{ color: "inherit" }, { color: "red", transform: "scale(1.25,1.25)" }, { color: "inherit" }];

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

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has("theme")) {
      let el = document.documentElement;
      el.classList.add("theme-toggle");
      el.setAttribute("data-theme", this.theme);
      el.setAttribute("color-scheme", this.theme);
      document.documentElement.style.setProperty('--my-variable-name', 'pink');
      document.documentElement.style.setProperty('color-scheme', this.theme);
      window.setTimeout(() => {
        el.classList.remove("theme-toggle");
      }, 1000);
    }
    if (changedProperties.has("ping")) {
      this.beat.animate(this.frames, 1000);
    }
  }

  render() {
     return html`
      <h1 style="text-align: center;width:100%;line-height:4rem"><a href="https://esphome.io/web-api" style="width:6rem;height:4rem;float:left;color:inherit" />${unsafeHTML(logo)}</a> ${document.title}
      <span id="beat" style="float:right;height:1rem;margin-bottom:1rem">❤</span></h1>
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
    `;
  }
}
