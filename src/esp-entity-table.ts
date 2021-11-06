import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

interface entityConfig {
  unique_id: string
  domain: string
  id: string
  state: string
  detail: string
  value: string
  name: string
  when: string
  icon?: string
}

@customElement("esp-entity-table")
export class EntityTable extends LitElement {

  @property({type: Array}) entities: entityConfig[] = []
  @property({ attribute: false }) source: EventSource | undefined

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.source.addEventListener("state", (e: Event) => {
      const messageEvent = (e as MessageEvent);
      const data = JSON.parse(messageEvent.data);
      let idx = this.entities.findIndex(x => x.unique_id === data.id);
      if (idx === -1 ) {
        // Dynamically add discovered..
        let parts = data.id.split("-")
        let entity = {
          unique_id: data.id,
          domain: parts[0],
          id: parts.slice(1).join("-"),
          state: data.state,
          value: data.value,
          name: data.name || data.id,
          icon: data.icon || null
        } as entityConfig
        this.entities.push(entity)
        this.requestUpdate()        
      } else {
        this.entities[idx].state = data.state
        this.entities[idx].value = data.value
        this.requestUpdate()
      }
    });
  }
  actionButton(entity:entityConfig, label: String, action?: String) {
    let a = action || label.toLowerCase();
    return html`<button class="button mr-1" @click=${() => this.restAction(entity, a)}>${label}</button>`
  }

  actionButtonOn(entity:entityConfig) {
    return this.actionButton(entity, "On", "turn_on")
  }

  actionButtonOff(entity:entityConfig) {
    return this.actionButton(entity, "Off", "turn_off")
  }

  actionButtonToggle(entity:entityConfig) {
    return this.actionButton(entity, "Toggle")
  }

  control(entity:entityConfig) {
    if (entity.domain === "fan" || entity.domain === "switch" || entity.domain === "light") return html`
    <span style="float:right">${this.actionButtonToggle(entity)}</span>
    <esp-switch .state="${entity.state}" @state="${(e:CustomEvent)=>{let act='turn_'+e.detail.state;this.restAction(entity,act.toLowerCase() )}}"></esp-switch>`;
    if (entity.domain === "cover") return html`${this.actionButton(entity, "Open")}${this.actionButton(entity, "Close")}${this.actionButton(entity, "Stop")}`;
    return html``;
  }

  restAction(entity:entityConfig, action: String) {
    fetch(`/${entity.domain}/${entity.id}/${action}`, {
      method: "POST",
      body: "true",
    }).then((r) => {
      console.log(r)
    });
  }

  render() {
    return html`
      <table class="w-100">
        <thead>
          <tr>
            <th>Name</th>
            <th>State</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
            ${this.entities.map(
            (component) =>html`
              <tr>
                <td>${component.name}</td>
                <td>${component.state}</td>
                <td>${this.control(component)}</td>
              </tr>
            `)}
        </tbody>
      </table>
    `;
  }

  static get styles() {
    return css`
    table {
      border-spacing: 0;
      border-collapse: collapse;
    }

      .w-100 {
        width: 100%;
      }
      .mr-1 {
        margin-right: 0.25rem;
      }
      th {
        font-weight: 600;
        text-align: left
      }
      th,
      td {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--c-gray-40);
      }
      tr:nth-child(2n),tr th {
        /* background-color:var(--c-gray-40) */
      }
    `;
  }  
}
