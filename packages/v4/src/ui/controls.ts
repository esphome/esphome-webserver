// Per-domain control renderers. Each control is plain HTML built once per
// entity view; patchControl() updates the dynamic bits in place on state
// events so inputs never lose focus. All interactive elements carry
// data-id/data-act/data-param attributes handled by the event dispatcher.
import { html } from "../core/dom";
import { DOMAIN_ICON, type Entity } from "../core/store";

const n = (v: unknown, d = 0): number => (typeof v === "number" ? v : d);

const btn = (
  e: Entity,
  label: string,
  action: string,
  disabled = false
): string => html`<button
  class="btn${disabled ? " cur" : ""}"
  data-id="${e.id}"
  data-act="${action}"
  ${disabled ? "disabled" : ""}
>
  ${label}
</button>`;

const sw = (e: Entity): string => html`<label class="sw">
  <input
    type="checkbox"
    data-id="${e.id}"
    data-sw
    ${e.state === "ON" ? "checked" : ""}
  /><span class="lever"></span></label
>`;

const slider = (
  e: Entity,
  action: string,
  param: string,
  val: number | string,
  min?: number,
  max?: number,
  step?: number
): string => {
  const lo = min ?? Math.min(0, Number(val));
  const hi = max ?? Math.max(10, Number(val));
  const pct = hi > lo ? ((Number(val) - lo) / (hi - lo)) * 100 : 0;
  return html`<div class="sl">
    <label>${lo}</label>
    <div class="slw" style="--p:${pct.toFixed(2)}">
      <span class="slv">${val}</span>
      <input
        type="range"
        data-id="${e.id}"
        data-act="${action}"
        data-param="${param}"
        step="${step ?? 1}"
        min="${lo}"
        max="${hi}"
        value="${val}"
      />
    </div>
    <label>${hi}</label>
  </div>`;
};

const sel = (
  e: Entity,
  action: string,
  param: string,
  options: (string | number)[],
  cur: string | number | undefined
): string => html`<select
  data-id="${e.id}"
  data-act="${action}"
  data-param="${param}"
>
  ${options.map(
    (o) =>
      html`<option value="${o}"${o == cur ? " selected" : ""}>${o}</option>`
  )}
</select>`;

const textIn = (e: Entity): string => html`<input
  type="${e.mode === 1 ? "password" : "text"}"
  data-id="${e.id}"
  data-set
  data-param="value"
  minlength="${e.min_length ?? 0}"
  maxlength="${e.max_length ?? 255}"
  pattern="${e.pattern || ""}"
  value="${e.value ?? ""}"
/>`;

const dateIn = (e: Entity, type: string): string => html`<input
  type="${type}"
  data-id="${e.id}"
  data-set
  data-param="value"
  value="${e.value ?? ""}"
/>`;

const colorIn = (e: Entity): string => {
  const hex = (v?: number) => (n(v) & 255).toString(16).padStart(2, "0");
  const c = e.color || {};
  return html`<input
    type="color"
    data-id="${e.id}"
    data-set
    data-param="color"
    value="#${hex(c.r)}${hex(c.g)}${hex(c.b)}"
  />`;
};

// state buttons: disabled while the entity already sits in the target state;
// with assumed_state nothing is treated as active so all stay pressable.
const stateButtons = (
  e: Entity,
  defs: [label: string, action: string, active?: string][]
): string =>
  html`${defs.map(([l, a, s]) =>
    btn(e, l, a, !e.assumed_state && s !== undefined && e.state === s)
  )}`;

const targetTemps = (e: Entity): string => {
  if (e.target_temperature_low !== undefined && e.target_temperature_high !== undefined) {
    return html`<div class="cr">
        <label>Target Low:&nbsp;</label>
        ${slider(e, "set", "target_temperature_low", n(e.target_temperature_low), e.min_temp, e.max_temp, e.step)}
      </div>
      <div class="cr">
        <label>Target High:&nbsp;</label>
        ${slider(e, "set", "target_temperature_high", n(e.target_temperature_high), e.min_temp, e.max_temp, e.step)}
      </div>`;
  }
  if (e.target_temperature !== undefined) {
    return html`<div class="cr">
      <label>Target:&nbsp;</label>
      ${slider(e, "set", "target_temperature", n(e.target_temperature), e.min_temp, e.max_temp, e.step)}
    </div>`;
  }
  return html``;
};

const currentTemp = (e: Entity): string =>
  e.current_temperature === undefined
    ? html``
    : html`<div class="cr"><label>Current:&nbsp;${e.current_temperature} °C</label></div>`;

const modeSel = (e: Entity, cur: string | number): string =>
  e.modes?.length
    ? html`<div class="cr"><label>Mode:&nbsp;</label>${sel(e, "set", "mode", e.modes, cur)}</div>`
    : "";

// climate and water_heater share current/target/mode
const thermo = (e: Entity, modeVal: string | number): string =>
  html`<div class="col">${currentTemp(e)}${targetTemps(e)}${modeSel(e, modeVal)}</div>`;

const lightExtras = (e: Entity): string => {
  let out = "";
  if (e.brightness !== undefined)
    out += slider(e, "turn_on", "brightness", n(e.brightness), 0, 255, 1);
  if (e.color_temp !== undefined)
    out += slider(e, "turn_on", "color_temp", n(e.color_temp), 154, 370, 1);
  if (e.color_mode === "rgb" || e.color_mode === "rgbw") out += colorIn(e);
  if (e.effects?.filter((v) => v !== "None").length)
    out += sel(e, "turn_on", "effect", e.effects, e.effect);
  return out;
};

export function controlHtml(e: Entity): string {
  switch (e.domain) {
    case "switch":
      return e.assumed_state
        ? html`${btn(e, "❌", "turn_off")}${btn(e, "✔️", "turn_on")}`
        : sw(e);
    case "button":
      return btn(e, "PRESS", "press");
    case "select":
      return sel(e, "set", "option", e.option || [], e.value);
    case "number":
      return e.mode === 1
        ? html`<div class="numrow">
            <input
              type="number"
              data-id="${e.id}"
              data-set
              data-param="value"
              step="${e.step ?? 1}"
              min="${e.min_value ?? Math.min(0, Number(e.value))}"
              max="${e.max_value ?? Math.max(10, Number(e.value))}"
              value="${e.value ?? ""}"
            />${e.uom}
          </div>`
        : html`<div class="numrow">${slider(
            e,
            "set",
            "value",
            Number(e.value) || 0,
            e.min_value,
            e.max_value,
            e.step
          )}<span class="uom">${e.uom}</span></div>`;
    case "text":
      return textIn(e);
    case "date":
      return dateIn(e, "date");
    case "time":
      return dateIn(e, "time");
    case "datetime":
      return dateIn(e, "datetime-local");
    case "light":
      return html`<div class="col">${sw(e)}<div class="cr">${lightExtras(e)}</div></div>`;
    case "fan":
      return html`<span>${e.speed} ${e.speed_level ?? ""}</span>${sw(e)}${e
        .speed_count
        ? slider(
            e,
            `turn_${(e.state || "off").toLowerCase()}`,
            "speed_level",
            n(e.speed_level),
            0,
            e.speed_count,
            1
          )
        : html``}`;
    case "climate":
      return thermo(e, e.mode ?? "");
    case "water_heater":
      return html`<div class="col">${thermo(e, e.state || "")}${
        e.away !== undefined
          ? html`<div class="cr"><label>Away:&nbsp;</label>${btn(
              e,
              e.away ? "ON" : "OFF",
              `set?away=${!e.away}`
            )}</div>`
          : ""
      }${
        e.is_on !== undefined
          ? html`<div class="cr"><label>Power:&nbsp;</label>${btn(
              e,
              e.is_on ? "ON" : "OFF",
              `set?is_on=${!e.is_on}`
            )}</div>`
          : ""
      }</div>`;
    case "cover":
      return stateButtons(e, [
        ["↑", "open", "OPEN"],
        ["☐", "stop"],
        ["↓", "close", "CLOSED"],
      ]);
    case "valve":
      return stateButtons(e, [
        ["OPEN", "open", "OPEN"],
        ["☐", "stop"],
        ["CLOSE", "close", "CLOSED"],
      ]);
    case "lock":
      return stateButtons(e, [
        ["🔐", "lock", "LOCKED"],
        ["🔓", "unlock", "UNLOCKED"],
        ["↑", "open"],
      ]);
    default:
      return html`<div class="st">${e.state}</div>`;
  }
}

// In-place update of the control's dynamic values on state events.
export function patchControl(e: Entity, root: HTMLElement): void {
  const byParam = (p: string): HTMLInputElement | HTMLSelectElement | null =>
    root.querySelector(`[data-param="${p}"]`);
  const setRange = (p: string, v?: number): void => {
    const input = byParam(p) as HTMLInputElement | null;
    if (!input || v === undefined || input === document.activeElement) return;
    input.value = String(v);
    const slw = input.closest<HTMLElement>(".slw");
    if (slw) {
      const lo = Number(input.min);
      const hi = Number(input.max);
      slw.style.setProperty("--p", (hi > lo ? ((v - lo) / (hi - lo)) * 100 : 0).toFixed(2));
      const bubble = slw.querySelector<HTMLElement>(".slv");
      if (bubble) bubble.textContent = String(v);
    }
  };
  const setSelect = (p: string, v?: string | number): void => {
    const s = byParam(p) as HTMLSelectElement | null;
    if (s && v !== undefined && s !== document.activeElement) s.value = String(v);
  };
  switch (e.domain) {
    case "switch":
    case "light":
    case "fan": {
      const box = root.querySelector<HTMLInputElement>("input[data-sw]");
      if (box) box.checked = e.state === "ON";
      if (e.domain === "light") {
        setRange("brightness", e.brightness);
        setRange("color_temp", e.color_temp);
        const c = byParam("color") as HTMLInputElement | null;
        if (c && e.color) {
          const hex = (v?: number) => (n(v) & 255).toString(16).padStart(2, "0");
          c.value = `#${hex(e.color.r)}${hex(e.color.g)}${hex(e.color.b)}`;
        }
        setSelect("effect", e.effect);
      }
      if (e.domain === "fan") setRange("speed_level", e.speed_level);
      break;
    }
    case "select":
      setSelect("option", e.value);
      break;
    case "number":
      if (e.mode === 1) {
        const i = byParam("value") as HTMLInputElement | null;
        if (i && i !== document.activeElement) i.value = String(e.value ?? "");
      } else {
        setRange("value", Number(e.value));
      }
      break;
    case "text":
    case "date":
    case "time":
    case "datetime": {
      const i = byParam("value") as HTMLInputElement | null;
      if (i && i !== document.activeElement) i.value = String(e.value ?? "");
      break;
    }
    case "climate":
      setRange("target_temperature", e.target_temperature);
      setRange("target_temperature_low", e.target_temperature_low);
      setRange("target_temperature_high", e.target_temperature_high);
      setSelect("mode", e.mode ?? "");
      break;
    case "water_heater":
      setRange("target_temperature", e.target_temperature);
      setRange("target_temperature_low", e.target_temperature_low);
      setRange("target_temperature_high", e.target_temperature_high);
      setSelect("mode", e.state);
      break;
  }
}
