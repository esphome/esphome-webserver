import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import cssReset from "./css/reset";
import cssButton from "./css/button";

interface entityConfig {
  unique_id: string;
  domain: string;
  id: string;
  state: string;
  detail: string;
  value: string;
  name: string;
  when: string;
  icon?: string;
  option?: string[];
}

@customElement("esp-entity-table")
export class EntityTable extends LitElement {
  @property({ type: Array }) entities: entityConfig[] = [];
  @property({ attribute: false }) source: EventSource | undefined;

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.source.addEventListener("state", (e: Event) => {
      const messageEvent = e as MessageEvent;
      const data = JSON.parse(messageEvent.data);
      let idx = this.entities.findIndex((x) => x.unique_id === data.id);
      if (idx === -1) {
        // Dynamically add discovered..
        let parts = data.id.split("-");
        let entity = { ...data, domain: parts[0], unique_id:data.id, id:parts.slice(1).join("-") } as entityConfig;
        this.entities.push(entity);
        this.requestUpdate();
      } else {
        this.entities[idx].state = data.state;
        this.entities[idx].value = data.value;
        this.requestUpdate();
      }
    });
  }
  actionButton(entity: entityConfig, label: String, action?: String) {
    let a = action || label.toLowerCase();
    return html`<button class="btn" @click=${() => this.restAction(entity, a)}>${label}</button>`;
  }

  control(entity: entityConfig) {
    if (entity.domain === "fan" || entity.domain === "switch" || entity.domain === "light")
      return html` <esp-switch
        color="var(--primary-color,currentColor)"
        .state="${entity.state}"
        @state="${(e: CustomEvent) => {
          let act = "turn_" + e.detail.state;
          this.restAction(entity, act.toLowerCase());
        }}"
      ></esp-switch>`;
    if (entity.domain === "cover") return html`${this.actionButton(entity, "Open")} ${this.actionButton(entity, "Stop")} ${this.actionButton(entity, "Close")}`;
    if (entity.domain === "select") {
      return html`
      <select @change="${(e:Event) => {
        let val= e.target.value;
        this.restAction(entity, `set?option=${val}`);
      }
      }">
            ${entity.option.map(option => html`
                <option value="${option}" ?selected=${entity.value === option}>${option}</option>
            `)}
        </select>`
    }
    
    return html``;
  }

  optionChange(entity: entityConfig) {
    console.dir(entity);
    return
  }
  

  restAction(entity: entityConfig, action: String) {
    fetch(`/${entity.domain}/${entity.id}/${action}`, {
      method: "POST",
      body: "true",
    }).then((r) => {
      console.log(r);
    });
  }

  render() {
    return html`
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>State</th>
            <th>Actions</th>
          </tr> 
        </thead>
        <tbody>
          ${this.entities.map(
            (component) => html`
              <tr>
                <td>${component.name}</td>
                <td>${component.state}</td>
                <td>${this.control(component)}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }

  static get styles() {
    return [
      cssReset,
      cssButton,
      css`
        table {
          border-spacing: 0;
          border-collapse: collapse;
          width: 100%;
          border: 1px solid currentColor;
        }

        th {
          font-weight: 600;
          text-align: left;
        }
        th,
        td {
          padding: 0.25rem 0.5rem;
          border: 1px solid currentColor;
        }
        td:nth-child(2),th:nth-child(2) {
          text-align:center
        }
        tr th,
        tr:nth-child(2n) {
          background-color: rgba(127, 127, 127, 0.3);
        }
        select {
          background-color: inherit;
          color: inherit;
          width:100%;
          border-radius: 4px;
        }
        option {
          color: currentColor;
          background-color: var(--primary-color,currentColor);
        }
      `,
    ];
  }
}
