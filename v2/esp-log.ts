import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

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
  @property({ type: Array }) logs: recordConfig[] = [];
  @property({ attribute: false }) source: EventSource | undefined;

  constructor() {
    super();
    this.logs = [];
  }

  connectedCallback() {
    super.connectedCallback();
    this.source.addEventListener("log", (e: Event) => {
      const messageEvent = e as MessageEvent;
      const d: String = messageEvent.data;
      let parts = d.slice(10, d.length - 4).split(":");
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
        tag: `${parts[0]}:${parts[1]}`,
        detail: parts[2],
        when: new Date().toTimeString().split(" ")[0],
      } as recordConfig;
      this.logs.unshift(record);
      this.logs = this.logs.slice(0, this.rows);
    })
  }

  render() {
    return html`
    <div style='overflow-x:auto'>
      <table>
        <thead>
          <tr>
            
            <th>Debug</th>
            <th style="width:50%">Detail</th>
            <th>Time</th>
            <th>level</th>
          </tr>
        </thead>
        <tbody>
          ${this.logs.map(
            (log: recordConfig) =>
              html`
                <tr class="${log.type}">
                  <td>${log.tag}</td>
                  <td><pre>${log.detail}</pre>
                  <td>${log.when}</td>
                  <td>${log.level}</td>
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
        line-height:1rem;
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
    `;
  }
}
