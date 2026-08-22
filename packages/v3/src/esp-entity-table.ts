import { html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { ifDefined } from "lit/directives/if-defined.js";
import cssReset from "./css/reset";
import cssButton from "./css/button";
import cssInput from "./css/input";
import cssEntityTable from "./css/esp-entity-table";
import cssTab from "./css/tab";
import "./esp-entity-chart";
import "iconify-icon";

interface entityConfig {
  unique_id: string;
  sorting_weight: number;
  sorting_group?: string;
  domain: string;
  id: string;
  state: string;
  detail: string;
  value: string;
  name: string;
  device?: string;  // Device name for hierarchical URLs (sub-devices only)
  entity_category?: number;
  when: string;
  icon?: string;
  option?: string[];
  assumed_state?: boolean;
  brightness?: number;
  color_temp?: number;
  color_mode?: string;
  color: object;
  target_temperature?: number;
  target_temperature_low?: number;
  target_temperature_high?: number;
  min_temp?: number;
  max_temp?: number;
  min_value?: number;
  max_value?: number;
  step?: number;
  min_length?: number;
  max_length?: number;
  pattern?: string;
  current_temperature?: number;
  modes?: number[];
  mode?: number;
  speed_count?: number;
  speed_level?: number;
  speed: string;
  effects?: string[];
  effect?: string;
  has_action?: boolean;
  value_numeric_history: number[];
  uom?: string;
  is_disabled_by_default?: boolean;
  // Water heater specific
  away?: boolean;
  is_on?: boolean;
  // Infrared specific
  supports_transmitter?: boolean;
  supports_receiver?: boolean;
}

interface groupConfig {
  name: string;
  sorting_weight: number;  
}

export const stateOn = "ON";
export const stateOff = "OFF";

export function getBasePath() {
  let str = window.location.pathname;
  return str.endsWith("/") ? str.slice(0, -1) : str;
}

// ID format detection and parsing helpers
// New format: "domain/entity_name" or "domain/device_name/entity_name"
// Old format: "domain-object_id" (deprecated)

function isNewIdFormat(id: string): boolean {
  return id.includes('/');
}

function parseDomainFromId(id: string): string {
  if (isNewIdFormat(id)) {
    return id.split('/')[0];
  }
  // Old format: domain-object_id
  return id.split('-')[0];
}

function buildEntityActionUrl(basePath: string, entity: entityConfig, action: string): string {
  if (isNewIdFormat(entity.unique_id)) {
    // New format: /{domain}/{device?}/{name}/{action}
    const entityName = encodeURIComponent(entity.name);
    const devicePart = entity.device
      ? `${encodeURIComponent(entity.device)}/`
      : '';
    return `${basePath}/${entity.domain}/${devicePart}${entityName}/${action}`;
  }
  // Old format: /{domain}/{object_id}/{action}
  const objectId = entity.unique_id.split('-').slice(1).join('-');
  return `${basePath}/${entity.domain}/${objectId}/${action}`;
}

function buildIdFetchUrl(basePath: string, id: string): string {
  // URL-encode each path segment for fetching detail_all
  let urlPath: string;
  if (isNewIdFormat(id)) {
    // New format: domain/name or domain/device/name
    urlPath = id.split('/').map((s: string) => encodeURIComponent(s)).join('/');
  } else {
    // Old format: domain-object_id -> domain/object_id
    const parts = id.split('-');
    const domain = parts[0];
    const objectId = parts.slice(1).join('-');
    urlPath = `${domain}/${encodeURIComponent(objectId)}`;
  }
  return `${basePath}/${urlPath}?detail=all`;
}

interface RestAction {
  restAction(entity?: entityConfig, action?: string): void;
}

const MAX_HISTORY = 50;
// Number of state events for an unrecognised entity to tolerate before asking
// the device for its details - the esp may still send a detail_all event.
const UNKNOWN_EVENT_THRESHOLD = 3;
// Cap on detail requests per unrecognised entity. Without it a device that
// never describes an entity is refetched on every state event, forever.
const MAX_DETAIL_FETCH_ATTEMPTS = 3;

interface unknownEntityState {
  events: number;
  attempts: number;
}

@customElement("esp-entity-table")
export class EntityTable extends LitElement implements RestAction {
  @state() entities: entityConfig[] = [];
  @state() has_controls: boolean = false;
  @state() show_all: boolean = false;

  private _actionRenderer = new ActionRenderer();
  private _basePath = getBasePath();
  private static ENTITY_UNDEFINED = "States";
  private static ENTITY_CATEGORIES = [
    "Sensor and Control",
    "Configuration",
    "Diagnostic",
  ];

  private groups: groupConfig[] = EntityTable._defaultGroups();

  private _unknown_entities: { [key: string]: unknownEntityState } = {};
  private _pending_detail_fetches = new Set<string>();

  private static _defaultGroups(): groupConfig[] {
    const groups = EntityTable.ENTITY_CATEGORIES.map((category, index) => ({
      name: category,
      sorting_weight: index,
    }));
    groups.push({ name: EntityTable.ENTITY_UNDEFINED, sorting_weight: -1 });
    groups.sort((a, b) => a.sorting_weight - b.sorting_weight);
    return groups;
  }

  private _handleState = (e: Event) => {
    const messageEvent = e as MessageEvent;
    const data = JSON.parse(messageEvent.data);
    // Prefer name_id (new format) over id (legacy format) for entity identification
    const entityId = data.name_id || data.id;
    if (!entityId) return;

    const idx = this.entities.findIndex((x) => x.unique_id === entityId);
    if (idx !== -1) {
      if (typeof data.value === "number") {
        const history = this.entities[idx].value_numeric_history;
        history.push(data.value);
        if (history.length > MAX_HISTORY) history.shift();
        // new array identity so the chart's property binding sees the change
        this.entities[idx].value_numeric_history = history.slice();
      }

      delete data.id;
      delete data.name_id;
      delete data.domain;
      delete data.unique_id;
      Object.assign(this.entities[idx], data);
      this.requestUpdate();
      return;
    }

    // is it a `detail_all` event already? (has name and domain)
    if (data.name && data.domain) {
      this.addEntity(data);
      return;
    }

    let unknown = this._unknown_entities[entityId];
    if (!unknown) {
      unknown = this._unknown_entities[entityId] = { events: 0, attempts: 0 };
    }
    unknown.events++;
    if (unknown.events < UNKNOWN_EVENT_THRESHOLD) return;
    if (unknown.attempts >= MAX_DETAIL_FETCH_ATTEMPTS) return;
    // only one detail request per entity may be in flight
    if (this._pending_detail_fetches.has(entityId)) return;
    unknown.attempts++;
    this._pending_detail_fetches.add(entityId);

    fetch(buildIdFetchUrl(this._basePath, entityId), { method: "GET" })
      .then((r) => {
        if (!r.ok) {
          throw new Error(`HTTP error! Status: ${r.status}`);
        }
        return r.json();
      })
      .then((detail) => {
        delete this._unknown_entities[entityId];
        this.addEntity(detail);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
      })
      .finally(() => {
        this._pending_detail_fetches.delete(entityId);
      });
  };

  private _handleSortingGroup = (e: Event) => {
    const messageEvent = e as MessageEvent;
    const data = JSON.parse(messageEvent.data);
    if (this.groups.some((x) => x.name === data.name)) return;
    this.groups.push({ ...data } as groupConfig);
    this.groups.sort((a, b) => a.sorting_weight - b.sorting_weight);
    this.requestUpdate();
  };

  connectedCallback() {
    super.connectedCallback();
    window.source?.addEventListener("state", this._handleState);
    window.source?.addEventListener("sorting_group", this._handleSortingGroup);
  }

  disconnectedCallback() {
    window.source?.removeEventListener("state", this._handleState);
    window.source?.removeEventListener(
      "sorting_group",
      this._handleSortingGroup
    );
    super.disconnectedCallback();
  }

  addEntity(data: any) {
    // Prefer name_id (new format) over id (legacy format) for entity identification
    const entityId = data.name_id || data.id;
    let idx = this.entities.findIndex((x) => x.unique_id === entityId);
    if (idx === -1 && entityId) {
      // Dynamically add discovered entity
      // domain comes from JSON (new format) or parsed from id (old format)
      const domain = data.domain || parseDomainFromId(entityId);
      let entity = {
        ...data,
        domain: domain,
        unique_id: entityId,
        sorting_group:
          data.sorting_group ??
          (EntityTable.ENTITY_CATEGORIES[Number(data.entity_category)] ||
            EntityTable.ENTITY_UNDEFINED),
        value_numeric_history:
          typeof data.value === "number" ? [data.value] : [],
      } as entityConfig;
      entity.has_action = this.hasAction(entity);
      if (entity.has_action) {
        this.has_controls = true;
      }
      this.entities.push(entity);
      // Groups are ordered by `this.groups` at render time, so entities only
      // need ordering within their group: by weight, then by name.
      this.entities.sort((a, b) => {
        const wa = a.sorting_weight ?? Number.MAX_SAFE_INTEGER;
        const wb = b.sorting_weight ?? Number.MAX_SAFE_INTEGER;
        if (wa !== wb) return wa - wb;
        const na = a.name.toLowerCase();
        const nb = b.name.toLowerCase();
        return na < nb ? -1 : na > nb ? 1 : 0;
      });
      this.requestUpdate();
    }
  }

  hasAction(entity: entityConfig): boolean {
    return `render_${entity.domain}` in this._actionRenderer;
  }

  control(entity: entityConfig) {
    this._actionRenderer.entity = entity;
    this._actionRenderer.actioner = this;
    this._actionRenderer.basePath = this._basePath;
    return this._actionRenderer.exec(
      `render_${entity.domain}` as ActionRendererMethodKey
    );
  }

  restAction(entity: entityConfig, action: string) {
    fetch(buildEntityActionUrl(this._basePath, entity, action), {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).catch((error) => {
      console.error("Action error:", error);
    });
  }

  renderShowAll() {
    if (
      !this.show_all &&
      this.entities.find((elem) => elem.is_disabled_by_default)
    ) {
      return html`<div class="singlebutton-row">
        <button
          class="abutton"
          @click="${(e: Event) => (this.show_all = true)}"
        >
          Show All
        </button>
      </div>`;
    }
    return nothing;
  }

  // Buckets entities by sorting_group, ordered by `this.groups`. Groups that
  // were never announced still render, after the known ones, so an entity can
  // never be silently dropped.
  private _groupEntities(entities: entityConfig[]): Map<string, entityConfig[]> {
    const buckets = new Map<string, entityConfig[]>();
    for (const entity of entities) {
      const name = entity.sorting_group || EntityTable.ENTITY_UNDEFINED;
      const bucket = buckets.get(name);
      if (bucket) {
        bucket.push(entity);
      } else {
        buckets.set(name, [entity]);
      }
    }

    const ordered = new Map<string, entityConfig[]>();
    for (const group of this.groups) {
      const bucket = buckets.get(group.name);
      if (bucket) {
        ordered.set(group.name, bucket);
        buckets.delete(group.name);
      }
    }
    for (const [name, bucket] of buckets) {
      ordered.set(name, bucket);
    }
    return ordered;
  }

  render() {
    const entities = this.show_all
      ? this.entities
      : this.entities.filter((elem) => !elem.is_disabled_by_default);
    return html`
      <div>
        ${repeat(
          this._groupEntities(entities),
          ([name]) => name,
          ([name, members]) => html`
            <div
              class="tab-header"
              @dblclick="${this._handleTabHeaderDblClick}"
            >
              ${name}
            </div>
            <div class="tab-container">
              ${repeat(
                members,
                (component) => component.unique_id,
                (component) => html`
                  <div
                    class="entity-row"
                    .domain="${component.domain}"
                    @click="${this._handleEntityRowClick}"
                  >
                    <div>
                      ${component.icon
                        ? html`<iconify-icon
                            icon="${component.icon}"
                            height="24px"
                          ></iconify-icon>`
                        : nothing}
                    </div>
                    <div>
                      ${component.device ? `[${component.device}] ` : ""}${component.name}
                    </div>
                    <div>
                      ${this.has_controls && component.has_action
                        ? this.control(component)
                        : html`<div>${component.state}</div>`}
                    </div>
                    ${component.domain === "sensor"
                      ? html`<esp-entity-chart
                          .chartdata="${component.value_numeric_history}"
                        ></esp-entity-chart>`
                      : nothing}
                  </div>
                `
              )}
            </div>
          `
        )}
        ${this.renderShowAll()}
      </div>
    `;
  }

  static get styles() {
    return [cssReset, cssButton, cssInput, cssEntityTable, cssTab];
  }

  _handleEntityRowClick(e: any) {
    if (e?.currentTarget?.domain === "sensor") {
      if (!e?.ctrlKey) e.stopPropagation();
      e?.currentTarget?.classList.toggle(
        "expanded",
        !e.ctrlKey ? undefined : true
      );
    }
  }
  _handleTabHeaderDblClick(e: Event) {
    const doubleClickEvent = new CustomEvent('entity-tab-header-double-clicked', {
      bubbles: true,
      composed: true,
    });
    e.target?.dispatchEvent(doubleClickEvent);
  }
}


type ActionRendererNonCallable = "entity" | "actioner" | "basePath" | "exec";
type ActionRendererMethodKey = keyof Omit<
  ActionRenderer,
  ActionRendererNonCallable
>;

class ActionRenderer {
  public entity?: entityConfig;
  public actioner?: RestAction;
  public basePath: string = "";

  exec(method: ActionRendererMethodKey) {
    if (typeof this[method] !== "function") {
      return;
    }
    return this[method]();
  }

  private _actionButton(entity: entityConfig, label: string, action: string, isCurrentState: boolean = false) {
    if (!entity) return;
    let a = action || label.toLowerCase();
    return html`<button
      class="${isCurrentState ? 'abuttonIsState' : 'abutton'}"
      ?disabled=${isCurrentState}
      @click=${() => this.actioner?.restAction(entity, a)}
    >
      ${label}
    </button>`;
  }

  private _datetime(
    entity: entityConfig,
    type: string,
    action: string,
    opt: string,
    value: string,
  ) {
    return html`
      <input 
        type="${type}" 
        name="${entity.unique_id}"
        id="${entity.unique_id}"
        .value="${value}"
        @change="${(e: Event) => {
          const val = (<HTMLTextAreaElement>e.target)?.value;
          this.actioner?.restAction(
            entity,
            `${action}?${opt}=${val.replace('T', ' ')}`
          );
        }}"
      />
    `;
  }

  private _switch(entity: entityConfig) {
    return html`<esp-switch
      color="var(--primary-color,currentColor)"
      .state=${entity.state}
      @state="${(e: CustomEvent) => {
        let act = "turn_" + e.detail.state;
        this.actioner?.restAction(entity, act.toLowerCase());
      }}"
    ></esp-switch>`;
  }

  private _select(
    entity: entityConfig,
    action: string,
    opt: string,
    options: string[] | number[],
    val: string | number | undefined
  ) {
    return html`<select
      @change="${(e: Event) => {
        const val = (<HTMLTextAreaElement>e.target)?.value;
        this.actioner?.restAction(
          entity,
          `${action}?${opt}=${encodeURIComponent(val)}`
        );
      }}"
    >
      ${options.map(
        (option) =>
          html`
            <option value="${option}" ?selected="${option == val}">
              ${option}
            </option>
          `
      )}
    </select>`;
  }

  private _range(
    entity: entityConfig,
    action: string,
    opt: string,
    value: string | number,
    min?: number,
    max?: number,
    step = 1
  ) {
    if (entity.mode == 1) {
      return html`<div class="range">
        <label>${min ?? 0}</label>
        <input
          type="number"
          name="${entity.unique_id}"
          id="${entity.unique_id}"
          step="${step}"
          min="${min ?? Math.min(0, Number(value))}"
          max="${max ?? Math.max(10, Number(value))}"
          .value="${value}"
          @change="${(e: Event) => {
            const val = (<HTMLInputElement>e.target)?.value;
            this.actioner?.restAction(entity, `${action}?${opt}=${val}`);
          }}"
        />
        <label>${max ?? 100}</label>
      </div>`;
    }
    return html`
      <esp-range-slider
        name="${entity.unique_id}"
        step="${step}"
        min="${ifDefined(min)}"
        max="${ifDefined(max)}"
        .value="${value}"
        @state="${(e: CustomEvent) => {
          this.actioner?.restAction(
            entity,
            `${action}?${opt}=${e.detail.state}`
          );
        }}"
      ></esp-range-slider>`;
  }

  private _textinput(
    entity: entityConfig,
    action: string,
    opt: string,
    value: string | number,
    min: number | undefined,
    max: number | undefined,
    pattern: string | undefined
  ) {
    return html`
      <input
        type="${entity.mode == 1 ? "password" : "text"}"
        name="${entity.unique_id}"
        id="${entity.unique_id}"
        minlength="${min ?? 0}"
        maxlength="${max ?? 255}"
        pattern="${pattern || ""}"
        .value="${value!}"
        @change="${(e: Event) => {
          const val = (<HTMLTextAreaElement>e.target)?.value;
          this.actioner?.restAction(
            entity,
            `${action}?${opt}=${encodeURIComponent(val)}`
          );
        }}"
      />
    `;
  }

  private _colorpicker(entity: entityConfig, action: string, value: any) {
    function u16tohex(d: number) {
      return (Number(d) || 0).toString(16).padStart(2, "0");
    }
    function rgb_to_str(rgbhex: string) {
      const rgb = rgbhex
        .match(/[0-9a-f]{2}/gi)
        ?.map((x) => parseInt(x, 16)) || [0, 0, 0];
      return `r=${rgb[0]}&g=${rgb[1]}&b=${rgb[2]}`;
    }

    return html`<div class="colorpicker">
      <input
        type="color"
        name="${entity.unique_id}"
        id="${entity.unique_id}"
        value="#${u16tohex(value?.r)}${u16tohex(value?.g)}${u16tohex(value?.b)}"
        @change="${(e: Event) => {
          const val = (<HTMLTextAreaElement>e.target)?.value;
          this.actioner?.restAction(entity, `${action}?${rgb_to_str(val)}`);
        }}"
      />
    </div>`;
  }

  // Shared by climate and water_heater: either a low/high pair or a single
  // target, depending on what the entity reports.
  private _targetTemperature(entity: entityConfig) {
    if (
      entity.target_temperature_low !== undefined &&
      entity.target_temperature_high !== undefined
    ) {
      return html`
        <div class="climate-row">
          <label>Target Low:&nbsp;</label>
          ${this._range(
            entity,
            "set",
            "target_temperature_low",
            entity.target_temperature_low,
            entity.min_temp,
            entity.max_temp,
            entity.step
          )}
        </div>
        <div class="climate-row">
          <label>Target High:&nbsp;</label>
          ${this._range(
            entity,
            "set",
            "target_temperature_high",
            entity.target_temperature_high,
            entity.min_temp,
            entity.max_temp,
            entity.step
          )}
        </div>`;
    }
    if (entity.target_temperature !== undefined) {
      return html`
        <div class="climate-row">
          <label>Target:&nbsp;</label>
          ${this._range(
            entity,
            "set",
            "target_temperature",
            entity.target_temperature,
            entity.min_temp,
            entity.max_temp,
            entity.step
          )}
        </div>`;
    }
    return nothing;
  }

  private _currentTemperature(entity: entityConfig) {
    if (entity.current_temperature === undefined) return nothing;
    return html`<div class="climate-row" style="padding-bottom: 10px">
      <label>Current:&nbsp;${entity.current_temperature} °C</label>
    </div>`;
  }

  // climate selects on `mode`, water_heater on `state`, so the current value
  // is passed in rather than derived here.
  private _modeSelect(entity: entityConfig, value: string | number) {
    if (!entity.modes?.length) return nothing;
    return html`
      <div class="climate-row">
        <label>Mode:&nbsp;</label>
        ${this._select(entity, "set", "mode", entity.modes, value)}
      </div>`;
  }

  // Shared by cover, valve and lock: a fixed set of buttons, each disabled
  // while the entity is already in the state it would move to. With
  // assumed_state the reported state may not reflect reality, so nothing is
  // treated as already-active and every button stays pressable.
  private _stateButtons(
    entity: entityConfig,
    buttons: [label: string, action: string, activeState?: string][]
  ) {
    const assumed = entity.assumed_state === true;
    return html`${buttons.map(([label, action, activeState]) =>
      this._actionButton(
        entity,
        label,
        action,
        !assumed && entity.state === activeState
      )
    )}`;
  }

  render_binary_sensor() {
    if (!this.entity) return;
    const isOn = this.entity.state == stateOn;
    return html`<iconify-icon
      class="binary_sensor_${this.entity.state?.toLowerCase()}"
      icon="mdi:checkbox-${isOn ? "marked-circle" : "blank-circle-outline"}"
      height="24px"
    ></iconify-icon>`;
  }

  render_date() {
    if (!this.entity) return;
    return html`
      ${this._datetime(
        this.entity,
        "date",
        "set",
        "value",
        this.entity.value,
      )}
    `;
  }

  render_time() {
    if (!this.entity) return;
    return html`
      ${this._datetime(
        this.entity,
        "time",
        "set",
        "value",
        this.entity.value,
      )}
    `;
  }

  render_datetime() {
    if (!this.entity) return;
    return html`
      ${this._datetime(
        this.entity,
        "datetime-local",
        "set",
        "value",
        this.entity.value,
      )}
    `;
  }

  render_switch() {
    if (!this.entity) return;
    if (this.entity.assumed_state)
      return html`${this._actionButton(this.entity, "❌", "turn_off")}
      ${this._actionButton(this.entity, "✔️", "turn_on")}`;
    else return this._switch(this.entity);
  }

  render_fan() {
    if (!this.entity) return;
    return [
      this.entity.speed,
      " ",
      this.entity.speed_level,
      this._switch(this.entity),
      this.entity.speed_count
        ? this._range(
            this.entity,
            `turn_${this.entity.state.toLowerCase()}`,
            "speed_level",
            this.entity.speed_level ? this.entity.speed_level : 0,
            0,
            this.entity.speed_count,
            1
          )
        : "",
    ];
  }

  render_light() {
    if (!this.entity) return;
    return [
      html`<div class="entity" style="
      width: 100%;">
        ${this._switch(this.entity)}
        ${this.entity.brightness !== undefined
          ? this._range(
              this.entity,
              "turn_on",
              "brightness",
              this.entity.brightness,
              0,
              255,
              1,
            )
          : ""}
        ${this.entity.color_temp !== undefined
          ? this._range(
              this.entity,
              "turn_on",
              "color_temp",
              this.entity.color_temp,
              154,
              370,
              1,
            )
          : ""}
        ${this.entity.color_mode === "rgb" || this.entity.color_mode === "rgbw"
          ? this._colorpicker(this.entity, "turn_on", this.entity?.color)
          : ""}
        ${this.entity.effects?.filter((v) => v != "None").length
          ? this._select(
              this.entity,
              "turn_on",
              "effect",
              this.entity.effects || [],
              this.entity.effect
            )
          : ""}
      </div> `,
    ];
  }

  render_lock() {
    if (!this.entity) return;
    return this._stateButtons(this.entity, [
      ["🔐", "lock", "LOCKED"],
      ["🔓", "unlock", "UNLOCKED"],
      ["↑", "open"],
    ]);
  }

  render_cover() {
    if (!this.entity) return;
    return this._stateButtons(this.entity, [
      ["↑", "open", "OPEN"],
      ["☐", "stop"],
      ["↓", "close", "CLOSED"],
    ]);
  }

  render_button() {
    if (!this.entity) return;
    return html`${this._actionButton(this.entity, "PRESS", "press")}`;
  }

  render_select() {
    if (!this.entity) return;
    return this._select(
      this.entity,
      "set",
      "option",
      this.entity.option || [],
      this.entity.value
    );
  }

  render_number() {
    if (!this.entity) return;
    return html`
      ${this._range(
        this.entity,
        "set",
        "value",
        this.entity.value,
        this.entity.min_value,
        this.entity.max_value,
        this.entity.step
      )}
      ${this.entity.uom}
    `;
  }

  render_text() {
    if (!this.entity) return;
    return this._textinput(
      this.entity,
      "set",
      "value",
      this.entity.value,
      this.entity.min_length,
      this.entity.max_length,
      this.entity.pattern
    );
  }

  render_climate() {
    if (!this.entity) return;
    return html`
      <div class="climate-wrap">
        ${this._currentTemperature(this.entity)}
        ${this._targetTemperature(this.entity)}
        ${this._modeSelect(this.entity, this.entity.mode ?? "")}
      </div>
    `;
  }

  render_valve() {
    if (!this.entity) return;
    return this._stateButtons(this.entity, [
      ["OPEN", "open", "OPEN"],
      ["☐", "stop"],
      ["CLOSE", "close", "CLOSED"],
    ]);
  }

  render_water_heater() {
    if (!this.entity) return;
    const entity = this.entity;

    // Away mode toggle (if supported)
    const away =
      entity.away !== undefined
        ? html`
            <div class="climate-row">
              <label>Away:&nbsp;</label>
              ${this._actionButton(
                entity,
                entity.away ? "ON" : "OFF",
                `set?away=${!entity.away}`
              )}
            </div>`
        : nothing;

    // On/Off toggle (if supported)
    const on_off =
      entity.is_on !== undefined
        ? html`
            <div class="climate-row">
              <label>Power:&nbsp;</label>
              ${this._actionButton(
                entity,
                entity.is_on ? "ON" : "OFF",
                `set?is_on=${!entity.is_on}`
              )}
            </div>`
        : nothing;

    return html`
      <div class="climate-wrap">
        ${this._currentTemperature(entity)} ${this._targetTemperature(entity)}
        ${this._modeSelect(entity, entity.state || "")} ${away} ${on_off}
      </div>
    `;
  }

  render_infrared() {
    if (!this.entity) return;

    // Only show transmit UI if entity supports transmitter
    if (this.entity.supports_transmitter !== true) {
      return nothing;
    }

    const entity = this.entity;
    const basePath = this.basePath;

    // Helper to encode timings array to base64url
    const encodeTimings = (timingsStr: string): string => {
      const timings = timingsStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      const buffer = new ArrayBuffer(timings.length * 4);
      const view = new DataView(buffer);
      timings.forEach((val, i) => view.setInt32(i * 4, val, true)); // little-endian
      const bytes = new Uint8Array(buffer);
      let binary = '';
      bytes.forEach(b => binary += String.fromCharCode(b));
      // Convert to base64url: replace + with -, / with _, remove padding =
      return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    const handleTransmit = (e: Event) => {
      const button = e.currentTarget as HTMLElement;
      const container = button.parentElement?.parentElement; // button -> .infrared-row -> .infrared-wrap
      if (!container) {
        console.error('Infrared: Could not find container');
        return;
      }

      const carrierInput = container.querySelector('input[data-field="carrier"]') as HTMLInputElement;
      const repeatInput = container.querySelector('input[data-field="repeat"]') as HTMLInputElement;
      const timingsInput = container.querySelector('input[data-field="timings"]') as HTMLInputElement;

      if (!carrierInput || !repeatInput || !timingsInput) {
        console.error('Infrared: Could not find input elements', { carrierInput, repeatInput, timingsInput });
        return;
      }

      const carrier = carrierInput.value || '38000';
      const repeat = repeatInput.value || '1';
      const timingsRaw = timingsInput.value || '';

      if (!timingsRaw.trim()) {
        console.warn('Infrared: No timings provided');
        return;
      }

      const timingsEncoded = encodeTimings(timingsRaw);

      // Build URL for transmit action (without query params - data goes in body)
      const url = buildEntityActionUrl(basePath, entity, 'transmit');

      // Send data in POST body to avoid URI Too Long error
      const body = new URLSearchParams();
      body.append('carrier_frequency', carrier);
      body.append('repeat_count', repeat);
      body.append('data', timingsEncoded);

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      }).catch(err => {
        console.error('Infrared: Transmit error', err);
      });
    };

    return html`
      <div class="infrared-wrap">
        <div class="infrared-row">
          <label>Carrier (Hz):&nbsp;</label>
          <input
            type="number"
            data-field="carrier"
            value="38000"
            min="1000"
            max="100000"
            style="width: 80px"
          />
        </div>
        <div class="infrared-row">
          <label>Repeat:&nbsp;</label>
          <input
            type="number"
            data-field="repeat"
            value="1"
            min="1"
            max="100"
            style="width: 50px"
          />
        </div>
        <div class="infrared-row">
          <label>Timings:&nbsp;</label>
          <input
            type="text"
            data-field="timings"
            placeholder="e.g. 9000,-4500,560,-560,..."
            style="width: 100%; min-width: 200px"
          />
        </div>
        <div class="infrared-row">
          <button class="abutton" @click=${handleTransmit}>TX</button>
        </div>
      </div>
    `;
  }
}
