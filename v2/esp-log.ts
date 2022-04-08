import { html, css, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

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

  render() {
    return html`
      <div class="flow-x">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>level</th>
              <th>Tag</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            ${this.logs.map(
              (log: recordConfig) =>
                html`
                <tr class="${log.type}">
                  <td>${log.when}</td>
                  <td>${log.level}</td>
                  <td>${log.tag}</td>
                  <td><pre>${log.detail}</pre></td>
                </td>
                </tr>
              `
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  static get styles() {
    return css`
      table {
        font-family: monospace;
        background-color: #1c1c1c;
        color: white;
        width: 100%;
        border: 1px solid #dfe2e5;
        line-height: 1;
      }

      thead {
        border: 1px solid #dfe2e5;
        line-height: 1rem;
      }
      th {
        text-align: left;
      }
      th,
      td {
        padding: 0.25rem 0.5rem;
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
      .flow-x {
        overflow-x: auto;
      }
    `;
  }
}
