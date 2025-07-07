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

      const types: Record<string, string> = {
        "[1;31m": "e",
        "[0;33m": "w",
        "[0;32m": "i",
        "[0;35m": "c",
        "[0;36m": "d",
        "[0;37m": "v",
      };

      // Extract the type from the color code
      const type = types[d.slice(0, 7)];
      if (!type) {
        // No color code, skip
        return;
      }

      // Extract content without color codes and ANSI termination
      const content = d.slice(7, d.length - 4);

      // Split by newlines to handle multi-line messages
      const lines = content.split('\n');

      // Process the first line to extract metadata
      const firstLine = lines[0];
      const parts = firstLine.slice(3).split(":");
      const tag = parts.slice(0, 2).join(":");
      const firstDetail = firstLine.slice(5 + tag.length);
      const level = firstLine.slice(0, 3);
      const when = new Date().toTimeString().split(" ")[0];

      // Create a log record for each line
      lines.forEach((line, index) => {
        const record = {
          type: type,
          level: level,
          tag: tag,
          detail: index === 0 ? firstDetail : line,
          when: when,
        } as recordConfig;
        this.logs.push(record);
      });

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
              <th>Level</th>
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
