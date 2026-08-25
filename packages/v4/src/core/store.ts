// Central app state plus a micro event bus. Components subscribe to the
// events they care about and patch their own DOM in place.

export interface Entity {
  id: string;
  domain: string;
  name: string;
  device?: string;
  state: string;
  value?: string;
  icon?: string;
  uom?: string;
  sorting_group: string;
  sorting_weight?: number;
  entity_category?: number;
  is_disabled_by_default?: boolean;
  has_action: boolean;
  hist: number[];
  // control payload (shape varies by domain/firmware)
  option?: string[];
  assumed_state?: boolean;
  brightness?: number;
  color_temp?: number;
  color_mode?: string;
  color?: { r?: number; g?: number; b?: number };
  effect?: string;
  effects?: string[];
  speed?: string;
  speed_level?: number;
  speed_count?: number;
  min_value?: number;
  max_value?: number;
  step?: number;
  mode?: number;
  min_length?: number;
  max_length?: number;
  pattern?: string;
  target_temperature?: number;
  target_temperature_low?: number;
  target_temperature_high?: number;
  min_temp?: number;
  max_temp?: number;
  current_temperature?: number;
  modes?: number[];
  away?: boolean;
  is_on?: boolean;
  supports_transmitter?: boolean;
}

export interface Group {
  name: string;
  weight: number;
}

export const CATEGORIES = [
  "Sensor and Control",
  "Configuration",
  "Diagnostic",
];
export const UNCATEGORIZED = "States";

export type Layout = "table" | "cards";

const dark = matchMedia("(prefers-color-scheme: dark)").matches;

export const store = {
  title: "",
  comment: "",
  ota: false,
  logging: true,
  uptime: 0, // ms since boot
  connected: true,
  lastSeen: 0,
  entities: new Map<string, Entity>(),
  groups: [...CATEGORIES.map((name, weight) => ({ name, weight })), {
    name: UNCATEGORIZED,
    weight: -1,
  }].sort((a, b) => a.weight - b.weight),
  showAll: false,
  layout: (localStorage.getItem("e4-layout") as Layout) || "table",
  theme: localStorage.getItem("e4-theme") || (dark ? "dark" : "light"),
};

type Fn = (a?: any) => void;
const subs: Record<string, Set<Fn>> = {};

export const on = (ev: string, fn: Fn): (() => void) => {
  (subs[ev] ??= new Set()).add(fn);
  return () => subs[ev].delete(fn);
};

export const emit = (ev: string, a?: any): void => {
  subs[ev]?.forEach((fn) => fn(a));
};

// Default icon per domain; also the source of truth for "has a control":
// every listed domain except the two read-only ones renders a control.
export const DOMAIN_ICON: Record<string, string> = {
  light: "lightbulb",
  switch: "toggle-switch",
  fan: "fan",
  cover: "window-open",
  lock: "lock",
  button: "gesture-tap-button",
  select: "format-list-bulleted",
  number: "numeric",
  text: "form-textbox",
  date: "calendar-clock",
  time: "calendar-clock",
  datetime: "calendar-clock",
  climate: "thermostat",
  water_heater: "water-boiler",
  valve: "valve",
  infrared: "remote",
  sensor: "chart-line",
  binary_sensor: "checkbox-marked-circle",
};
