// Debug log panel: appends parsed SSE log records as rows, capped at `rows`.
import { esc, Html, html } from "../core/dom";
import { emit, on } from "../core/store";

interface Rec {
  type: string;
  level: string;
  tag: string;
  when: string;
  lines: string[];
}

export class ELog extends HTMLElement {
  rows = 50;
  private body?: HTMLElement;
  private un?: () => void;

  connectedCallback(): void {
    this.innerHTML = html`
      <div class="sec-h" id="log-h">Debug Log</div>
      <div class="sec-b logs">
        <div class="lrow lhead">
          <div>Time</div><div>Level</div><div>Tag</div><div>Message</div>
        </div>
        <div class="lbody"></div>
      </div>
    `;
    this.body = this.querySelector<HTMLElement>(".lbody")!;
    this.un = on("log", (r: Rec) => this.push(r));
  }

  disconnectedCallback(): void {
    this.un?.();
    this.un = undefined;
  }

  private push(r: Rec): void {
    const b = this.body!;
    // follow the stream only if the user hasn't scrolled up to inspect history
    const stick = b.scrollTop + b.clientHeight >= b.scrollHeight - 40;
    const row = document.createElement("div");
    row.className = `lrow ${r.type}`;
    row.innerHTML = html`<div>${r.when}</div><div>${r.level}</div><div>${r.tag}</div><div>${new Html(
        esc(r.lines.join("\n")).replace(/\n/g, "<br>")
      )}</div>`;
    b.append(row);
    while (b.children.length > this.rows) b.firstChild!.remove();
    if (stick) b.scrollTop = b.scrollHeight;
  }
}

customElements.define("e-log", ELog);

// double click on the log header expands/collapses the log column
document.addEventListener("dblclick", (ev) => {
  if ((ev.target as HTMLElement).closest("#log-h")) emit("expand", "log");
});
