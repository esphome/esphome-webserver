import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import cssTab from "./css/tab";

interface recordConfig {
  type: string;
  level: string;
  tag: string;
  detail: string;
  when: string;
}

@customElement("esp-log")
export class DebugLog extends LitElement {
  @property({ type: Number }) rows = 10;
  @property({ type: String }) scheme = "";
  @state() logs: recordConfig[] = [];

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    window.source?.addEventListener("log", (e: Event) => {
      const messageEvent = e as MessageEvent;
      const d: String = messageEvent.data;
      let parts = d.slice(10, d.length - 4).split(":");
      let tag = parts.slice(0, 2).join(":");
      let detail = d.slice(12 + tag.length, d.length - 4);
      const types: Record<string, string> = {
        "[1;31m": "e",
        "[0;33m": "w",
        "[0;32m": "i",
        "[0;35m": "c",
        "[0;36m": "d",
        "[0;37m": "v",
      };
      const record = {
        type: types[d.slice(0, 7)],
        level: d.slice(7, 10),
        tag: tag,
        detail: detail,
        when: new Date().toTimeString().split(" ")[0],
      } as recordConfig;
      this.logs.push(record);
      this.logs = this.logs.slice(-this.rows);
    });
  }

  _handleClick(e: Event) {
    if (e?.ctrlKey) {
      const options = {
        detail: "logs-table",
        bubbles: true,
        composed: true,
      };
      this.dispatchEvent(new CustomEvent("toggle-layout", options));
    }
  }

  render() {
    return html`
      <div class="tab-header">Debug Log</div>
      <div class="tab-container">
        <div
          class="logs"
          @click="${this._handleClick}"
          color-scheme="${this.scheme}"
        >
          <div class="thead trow">
            <div>Time</div>
            <div>Level</div>
            <div>Tag</div>
            <div>Message</div>
          </div>
          <div class="tbody">
            ${this.logs.map(
              (log: recordConfig) =>
                html`
              <div class="trow ${log.type}">
                <div>${log.when}</div>
                <div>${log.level}</div>
                <div>${log.tag}</div>
                <div>${log.detail}</div>
              </td>
            `
            )}
          </div>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      cssTab,
      css`
        .thead,
        .tbody .trow:nth-child(2n) {
          background-color: rgba(127, 127, 127, 0.05);
        }
        .trow div {
          font-family: monospace;
          width: 100%;
          line-height: 1.2rem;
        }
        .trow {
          display: flex;
        }
        .thead {
          line-height: 1rem;
        }
        .thead .trow {
          text-align: left;
          padding: 0.25rem 0.5rem;
        }
        .trow {
          display: flex;
        }
        .trow > div {
          align-self: flex-start;
          padding-right: 0.25em;
          flex: 2 0;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .trow > div:nth-child(2) {
          flex: 1 0;
        }
        .trow > div:nth-child(3) {
          flex: 3 0;
        }
        .trow > div:last-child {
          flex: 15 0;
          padding-right: 0em;
        }
        pre {
          margin: 0;
        }
        .v {
          color: #888888;
        }
        .d {
          color: #00dddd;
        }
        .c {
          color: magenta;
        }
        .i {
          color: limegreen;
        }
        .w {
          color: yellow;
        }
        .e {
          color: red;
          font-weight: bold;
        }
        .logs[color-scheme="light"] {
          font-weight: bold;
        }
        .logs[color-scheme="light"] .w {
          color: #cccc00;
        }
        .logs[color-scheme="dark"] .d {
          color: #00aaaa;
        }
        .logs {
          overflow-x: auto;
          border-radius: 12px;
          border-width: 1px;
          border-style: solid;
          border-color: rgba(127, 127, 127, 0.12);
          transition: all 0.3s ease-out 0s;
          font-size: 14px;
          padding: 16px;
        }
        @media (max-width: 1024px) {
          .trow > div:nth-child(2) {
            display: none !important;
          }
        }
      `,
    ];
  }
}
