import { html, css, LitElement } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { getBasePath, buildEntityActionUrl } from "./esp-entity-table";
import cssReset from "./css/reset";

interface SerialChannelConfig {
  unique_id: string;
  domain: string;
  name: string;
  device?: string;
  baud_rate?: number;
  data_bits?: number;
  stop_bits?: number;
  parity?: string;
}

@customElement("esp-serial-terminal")
export class SerialTerminal extends LitElement {
  @property({ type: Object }) entity!: SerialChannelConfig;
  @state() private terminal?: Terminal;
  @query("#terminal-container") terminalContainer?: HTMLDivElement;

  private inputBuffer: string = "";
  private basePath = getBasePath();

  connectedCallback() {
    super.connectedCallback();
    
    // Listen for state updates for this specific entity
    window.source?.addEventListener("state", (e: Event) => {
      const messageEvent = e as MessageEvent;
      const data = JSON.parse(messageEvent.data);
      
      if (data.id === this.entity.unique_id && data.value) {
        this.handleIncomingData(data.value);
      }
    });
  }

  firstUpdated() {
    if (!this.terminalContainer) return;

    // Initialize xterm.js terminal
    this.terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: "#1e1e1e",
        foreground: "#d4d4d4",
      },
      cols: 80,
      rows: 24,
    });

    this.terminal.open(this.terminalContainer);

    // Handle user input
    this.terminal.onData((data) => {
      this.handleUserInput(data);
    });

    // Display connection info
    if (this.entity.baud_rate) {
      this.terminal.writeln(
        `\x1b[36m${this.entity.baud_rate} baud, ${this.entity.data_bits || 8}N${this.entity.stop_bits || 1}\x1b[0m`
      );
    }

    // Focus the terminal so keyboard input works
    this.terminal.focus();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.terminal) {
      this.terminal.dispose();
    }
  }

  private handleIncomingData(base64Data: string) {
    if (!this.terminal) return;

    try {
      // Decode base64 data
      const decoded = atob(base64Data);
      
      // Write to terminal
      this.terminal.write(decoded);
    } catch (error) {
      console.error("Failed to decode serial data:", error);
    }
  }

  private handleUserInput(data: string) {
    if (!this.terminal) return;

    // Handle special characters
    if (data === "\r") {
      // Enter key - send the buffered input with newline
      this.terminal.write("\r\n");
      this.sendData(this.inputBuffer + "\r\n");
      this.inputBuffer = "";
    } else if (data === "\u007F") {
      // Backspace
      if (this.inputBuffer.length > 0) {
        this.inputBuffer = this.inputBuffer.slice(0, -1);
        this.terminal.write("\b \b");
      }
    } else if (data === "\u0003") {
      // Ctrl+C
      this.terminal.write("^C\r\n");
      this.sendData("\x03");
      this.inputBuffer = "";
    } else {
      // Regular character - send immediately (no buffering)
      this.sendData(data);
      this.terminal.write(data);
    }
  }

  private sendData(data: string) {
    try {
      // Encode data to base64
      const base64Data = btoa(data);
      
      // Build URL
      const url = `${this.basePath}/serial_channel/${encodeURIComponent(this.entity.name)}/send?value=${base64Data}`;

      console.log("Sending serial data:", data, "as base64:", base64Data, "to:", url);

      fetch(url, {
        method: "POST",
        headers: {
          "Content-Length": "0",
        },
      }).then((r) => {
        if (!r.ok) {
          console.error("Failed to send serial data:", r.status, r.statusText);
        } else {
          console.log("Serial data sent successfully");
        }
      }).catch((err) => {
        console.error("Error sending serial data:", err);
      });
    } catch (error) {
      console.error("Failed to encode/send serial data:", error);
    }
  }

  render() {
    return html`
      <div class="serial-terminal-wrapper">
        <div id="terminal-container"></div>
      </div>
    `;
  }

  static get styles() {
    return [
      cssReset,
      css`
        :host {
          display: block;
          width: 100%;
        }
        .serial-terminal-wrapper {
          background-color: #1e1e1e;
          padding: 12px;
          border-radius: 8px;
          overflow: hidden;
          margin: 0 16px 8px 16px;
          position: relative;
        }
        #terminal-container {
          width: 100%;
          height: 300px;
          cursor: text;
        }
        /* Ensure xterm viewport is properly positioned */
        #terminal-container .xterm {
          padding: 0;
        }
        #terminal-container .xterm-viewport {
          overflow-y: hidden !important;
        }
        #terminal-container .xterm-screen {
          position: relative;
          overflow: hidden;
        }
      `,
    ];
  }
}
