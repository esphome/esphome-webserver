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
      <div class="logs">
        <div class='thead trow'>
            <div>Time</div>
            <div>level</div>
            <div>Tag</div>
            <div>Message</div>
        </div>
        <div class='tbody'>
          ${this.logs.map(
            (log: recordConfig) =>
              html`
              <div class="trow ${log.type}">
                <div>${log.when}</div>
                <div>${log.level}</div>
                <div>${log.tag}</div>
                <div><pre>${log.detail}</pre></div>
              </td>
            `
          )}
        </div>
      </div>
    `;
  }

  static get styles() {
    return css`
      .thead,
      .tbody .trow:nth-child(2n) {
        background-color: rgba(127,127,127,0.05);
      }
      .trow div {
        font-family: monospace;
        color: white;
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
        // padding-right: 3em;
        //flex: 1 1 auto;
        flex: 1;
        align-self: flex-start;
        padding-right: 2em;
      }
      .trow > div:last-child {
        // flex: 5 1 auto;
        flex: 5;
        overflow: hidden;
        padding-right: 0em;
      }
      pre {
        margin: 0;
      }
      .v div {
        color: #888888;
      }
      .d div {
        color: #00dddd;
      }
      .c div {
        color: magenta;
      }
      .i div {
        color: limegreen;
      }
      .w div {
        color: yellow;
      }
      .e div {
        color: red;
        font-weight: bold;
      }
      .logs {
        overflow-x: auto;

        border-radius: 12px;
        border-width: 1px;
        border-style: solid;
        border-color: rgba(127,127,127,0.12);
        transition: all 0.3s ease-out 0s;
        font-size: 14px;
        background-color: rgba(127,127,127,0.05);
        padding: 16px;
    }
    `;
  }
}
