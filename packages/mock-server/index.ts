/**
 * ESPHome Web Server Mock - Comprehensive Entity Coverage
 * Tests ALL entity types and their variations for UI development.
 * Run with: npx tsx index.ts
 */

import http, { IncomingMessage, ServerResponse } from "http";

const PORT = 5002;
const startTime = Date.now();

// ============================================================================
// Types - All ESPHome Entity Types
// ============================================================================

interface BaseEntity {
  unique_id: string;
  domain: string;
  id: string;
  name: string;
  state: string;
  value?: string | number | boolean;
  icon?: string;
  sorting_weight: number;
  sorting_group?: string;
  entity_category?: number; // 0=control, 1=config, 2=diagnostic
  device?: string;
  is_disabled_by_default?: boolean;
}

interface SensorEntity extends BaseEntity {
  domain: "sensor";
  uom?: string;
  accuracy_decimals?: number;
  device_class?: string;
}

interface TextSensorEntity extends BaseEntity {
  domain: "text_sensor";
}

interface BinarySensorEntity extends BaseEntity {
  domain: "binary_sensor";
  device_class?: string;
}

interface SwitchEntity extends BaseEntity {
  domain: "switch";
  assumed_state?: boolean;
  device_class?: string;
}

interface ButtonEntity extends BaseEntity {
  domain: "button";
  device_class?: string;
}

interface LightEntity extends BaseEntity {
  domain: "light";
  brightness?: number;
  color_mode?: string;
  supported_color_modes?: string[];
  r?: number;
  g?: number;
  b?: number;
  w?: number;
  c?: number;
  color_temp?: number;
  min_mireds?: number;
  max_mireds?: number;
  effects?: string[];
  effect?: string;
}

interface FanEntity extends BaseEntity {
  domain: "fan";
  speed_level?: number;
  speed_count?: number;
  oscillation?: boolean;
  direction?: string;
  preset_mode?: string;
  preset_modes?: string[];
}

interface CoverEntity extends BaseEntity {
  domain: "cover";
  position?: number;
  tilt?: number;
  current_operation?: string;
  device_class?: string;
  _animating?: boolean;
}

interface ClimateEntity extends BaseEntity {
  domain: "climate";
  current_temperature?: number;
  current_humidity?: number;
  target_temperature?: number;
  target_temperature_low?: number;
  target_temperature_high?: number;
  min_temp?: string;
  max_temp?: string;
  step?: number;
  modes?: string[];
  mode?: string;
  action?: string;
  fan_mode?: string;
  fan_modes?: string[];
  swing_mode?: string;
  swing_modes?: string[];
  preset?: string;
  presets?: string[];
  custom_fan_mode?: string;
  custom_preset?: string;
}

interface NumberEntity extends BaseEntity {
  domain: "number";
  min_value?: string;
  max_value?: string;
  step?: string;
  uom?: string;
  mode?: number; // 0=slider, 1=box
}

interface SelectEntity extends BaseEntity {
  domain: "select";
  option?: string[];
}

interface TextEntity extends BaseEntity {
  domain: "text";
  min_length?: number;
  max_length?: number;
  pattern?: string;
  mode?: number; // 0=text, 1=password
}

interface DateEntity extends BaseEntity {
  domain: "date";
}

interface TimeEntity extends BaseEntity {
  domain: "time";
}

interface DateTimeEntity extends BaseEntity {
  domain: "datetime";
}

interface LockEntity extends BaseEntity {
  domain: "lock";
  supports_open?: boolean;
}

interface ValveEntity extends BaseEntity {
  domain: "valve";
  position?: number;
  current_operation?: string;
  supports_position?: boolean;
}

interface AlarmControlPanelEntity extends BaseEntity {
  domain: "alarm_control_panel";
  requires_code?: boolean;
  requires_code_to_arm?: boolean;
}

interface EventEntity extends BaseEntity {
  domain: "event";
  event_type?: string;
  event_types?: string[];
  device_class?: string;
}

interface UpdateEntity extends BaseEntity {
  domain: "update";
  current_version?: string;
  latest_version?: string;
  title?: string;
  summary?: string;
  release_url?: string;
  in_progress?: boolean;
  progress?: number;
}

interface MediaPlayerEntity extends BaseEntity {
  domain: "media_player";
  is_muted?: boolean;
  volume?: number;
  tts_url?: string;
  media_url?: string;
}

type Entity =
  | SensorEntity
  | TextSensorEntity
  | BinarySensorEntity
  | SwitchEntity
  | ButtonEntity
  | LightEntity
  | FanEntity
  | CoverEntity
  | ClimateEntity
  | NumberEntity
  | SelectEntity
  | TextEntity
  | DateEntity
  | TimeEntity
  | DateTimeEntity
  | LockEntity
  | ValveEntity
  | AlarmControlPanelEntity
  | EventEntity
  | UpdateEntity
  | MediaPlayerEntity;

// ============================================================================
// State
// ============================================================================

const entities: Map<string, Entity> = new Map();
const lazyEntities: Map<string, Entity> = new Map();
const clients = new Set<ServerResponse>();

const sortingGroups = [
  { name: "Lights", sorting_weight: 0 },
  { name: "Climate", sorting_weight: 1 },
  { name: "Covers", sorting_weight: 2 },
  { name: "Fans", sorting_weight: 3 },
  { name: "Sensors", sorting_weight: 4 },
  { name: "Controls", sorting_weight: 5 },
  { name: "Configuration", sorting_weight: 6 },
  { name: "Diagnostic", sorting_weight: 7 },
];

// ============================================================================
// Entity Initialization - ALL Types with Variations
// ============================================================================

function initEntities() {
  let weight = 0;

  // =========================================================================
  // LIGHTS - All color modes and variations
  // =========================================================================

  // Binary light (on/off only)
  entities.set("light-ceiling", {
    unique_id: "light-ceiling",
    domain: "light",
    id: "ceiling",
    name: "Ceiling Light",
    state: "ON",
    value: true,
    icon: "mdi:ceiling-light",
    color_mode: "onoff",
    supported_color_modes: ["onoff"],
    sorting_weight: weight++,
    sorting_group: "Lights",
  });

  // Brightness-only light
  entities.set("light-dimmer", {
    unique_id: "light-dimmer",
    domain: "light",
    id: "dimmer",
    name: "Dimmable Light",
    state: "ON",
    value: true,
    brightness: 178,
    color_mode: "brightness",
    supported_color_modes: ["brightness"],
    effects: ["None", "Strobe", "Flicker"],
    effect: "None",
    sorting_weight: weight++,
    sorting_group: "Lights",
  });

  // Color temperature light
  entities.set("light-desk", {
    unique_id: "light-desk",
    domain: "light",
    id: "desk",
    name: "Desk Lamp",
    state: "ON",
    value: true,
    brightness: 255,
    color_mode: "color_temp",
    supported_color_modes: ["color_temp"],
    color_temp: 350,
    min_mireds: 153,
    max_mireds: 500,
    sorting_weight: weight++,
    sorting_group: "Lights",
  });

  // RGB light
  entities.set("light-rgb_strip", {
    unique_id: "light-rgb_strip",
    domain: "light",
    id: "rgb_strip",
    name: "RGB Strip",
    state: "ON",
    value: true,
    brightness: 255,
    color_mode: "rgb",
    supported_color_modes: ["rgb"],
    r: 255,
    g: 100,
    b: 50,
    effects: [
      "None",
      "Rainbow",
      "Color Wipe",
      "Scan",
      "Twinkle",
      "Random",
      "Fireworks",
    ],
    effect: "None",
    sorting_weight: weight++,
    sorting_group: "Lights",
  });

  // RGBW light
  entities.set("light-rgbw", {
    unique_id: "light-rgbw",
    domain: "light",
    id: "rgbw",
    name: "RGBW Light",
    state: "OFF",
    value: false,
    brightness: 200,
    color_mode: "rgbw",
    supported_color_modes: ["rgbw"],
    r: 128,
    g: 64,
    b: 255,
    w: 128,
    sorting_weight: weight++,
    sorting_group: "Lights",
  });

  // RGBWW (RGB + Cold White + Warm White)
  entities.set("light-rgbww", {
    unique_id: "light-rgbww",
    domain: "light",
    id: "rgbww",
    name: "RGBWW Bulb",
    state: "ON",
    value: true,
    brightness: 220,
    color_mode: "rgbww",
    supported_color_modes: ["rgbww", "color_temp"],
    r: 0,
    g: 200,
    b: 150,
    c: 100,
    w: 80,
    color_temp: 300,
    min_mireds: 153,
    max_mireds: 500,
    sorting_weight: weight++,
    sorting_group: "Lights",
  });

  // Disabled light
  entities.set("light-debug_led", {
    unique_id: "light-debug_led",
    domain: "light",
    id: "debug_led",
    name: "Debug LED",
    state: "OFF",
    value: false,
    color_mode: "onoff",
    supported_color_modes: ["onoff"],
    sorting_weight: weight++,
    sorting_group: "Lights",
    entity_category: 2,
    is_disabled_by_default: true,
  });

  // =========================================================================
  // CLIMATE - All modes and variations
  // =========================================================================
  weight = 0;

  // Simple heat-only thermostat
  entities.set("climate-heater", {
    unique_id: "climate-heater",
    domain: "climate",
    id: "heater",
    name: "Room Heater",
    state: "HEATING",
    icon: "mdi:radiator",
    current_temperature: 19.5,
    target_temperature: 22,
    min_temp: "5",
    max_temp: "35",
    step: 0.5,
    modes: ["OFF", "HEAT"],
    mode: "HEAT",
    action: "HEATING",
    sorting_weight: weight++,
    sorting_group: "Climate",
  });

  // Cool-only AC
  entities.set("climate-ac", {
    unique_id: "climate-ac",
    domain: "climate",
    id: "ac",
    name: "Air Conditioner",
    state: "COOLING",
    icon: "mdi:air-conditioner",
    current_temperature: 26.3,
    target_temperature: 24,
    min_temp: "16",
    max_temp: "30",
    step: 1,
    modes: ["OFF", "COOL", "FAN_ONLY", "DRY"],
    mode: "COOL",
    action: "COOLING",
    fan_modes: ["AUTO", "LOW", "MEDIUM", "HIGH"],
    fan_mode: "AUTO",
    swing_modes: ["OFF", "VERTICAL", "HORIZONTAL", "BOTH"],
    swing_mode: "VERTICAL",
    sorting_weight: weight++,
    sorting_group: "Climate",
  });

  // Full-featured HVAC with dual setpoint
  entities.set("climate-hvac", {
    unique_id: "climate-hvac",
    domain: "climate",
    id: "hvac",
    name: "HVAC System",
    state: "IDLE",
    icon: "mdi:hvac",
    current_temperature: 21.0,
    current_humidity: 45,
    target_temperature_low: 20,
    target_temperature_high: 24,
    min_temp: "10",
    max_temp: "30",
    step: 0.5,
    modes: ["OFF", "HEAT_COOL", "HEAT", "COOL", "DRY", "FAN_ONLY", "AUTO"],
    mode: "HEAT_COOL",
    action: "IDLE",
    fan_modes: ["AUTO", "QUIET", "LOW", "MEDIUM", "HIGH", "TURBO"],
    fan_mode: "AUTO",
    swing_modes: ["OFF", "VERTICAL", "HORIZONTAL", "BOTH"],
    swing_mode: "OFF",
    presets: [
      "NONE",
      "HOME",
      "AWAY",
      "BOOST",
      "COMFORT",
      "ECO",
      "SLEEP",
      "ACTIVITY",
    ],
    preset: "HOME",
    sorting_weight: weight++,
    sorting_group: "Climate",
  });

  // =========================================================================
  // COVERS - Position, tilt, device classes
  // =========================================================================
  weight = 0;

  // Simple cover (open/close only)
  entities.set("cover-garage", {
    unique_id: "cover-garage",
    domain: "cover",
    id: "garage",
    name: "Garage Door",
    state: "CLOSED",
    value: 0,
    icon: "mdi:garage",
    device_class: "garage",
    current_operation: "IDLE",
    sorting_weight: weight++,
    sorting_group: "Covers",
  });

  // Cover with position
  entities.set("cover-blinds", {
    unique_id: "cover-blinds",
    domain: "cover",
    id: "blinds",
    name: "Window Blinds",
    state: "OPEN",
    value: 0.75,
    position: 0.75,
    device_class: "blind",
    current_operation: "IDLE",
    sorting_weight: weight++,
    sorting_group: "Covers",
  });

  // Cover with position and tilt
  entities.set("cover-shutter", {
    unique_id: "cover-shutter",
    domain: "cover",
    id: "shutter",
    name: "Roller Shutter",
    state: "OPEN",
    value: 0.5,
    position: 0.5,
    tilt: 0.3,
    device_class: "shutter",
    current_operation: "IDLE",
    sorting_weight: weight++,
    sorting_group: "Covers",
  });

  // Curtain
  entities.set("cover-curtain", {
    unique_id: "cover-curtain",
    domain: "cover",
    id: "curtain",
    name: "Living Room Curtains",
    state: "OPEN",
    value: 1.0,
    position: 1.0,
    device_class: "curtain",
    current_operation: "IDLE",
    sorting_weight: weight++,
    sorting_group: "Covers",
  });

  // =========================================================================
  // FANS - Speed levels, oscillation, presets
  // =========================================================================
  weight = 0;

  // Simple on/off fan
  entities.set("fan-exhaust", {
    unique_id: "fan-exhaust",
    domain: "fan",
    id: "exhaust",
    name: "Exhaust Fan",
    state: "OFF",
    value: false,
    icon: "mdi:fan",
    sorting_weight: weight++,
    sorting_group: "Fans",
  });

  // Fan with speed levels
  entities.set("fan-ceiling", {
    unique_id: "fan-ceiling",
    domain: "fan",
    id: "ceiling",
    name: "Ceiling Fan",
    state: "ON",
    value: true,
    speed_level: 2,
    speed_count: 4,
    direction: "FORWARD",
    oscillation: false,
    sorting_weight: weight++,
    sorting_group: "Fans",
  });

  // Fan with oscillation and presets
  entities.set("fan-tower", {
    unique_id: "fan-tower",
    domain: "fan",
    id: "tower",
    name: "Tower Fan",
    state: "ON",
    value: true,
    speed_level: 3,
    speed_count: 5,
    oscillation: true,
    preset_modes: ["Normal", "Natural", "Sleep", "Auto"],
    preset_mode: "Natural",
    sorting_weight: weight++,
    sorting_group: "Fans",
  });

  // =========================================================================
  // SENSORS - Various device classes and units
  // =========================================================================
  weight = 0;

  // Temperature sensor
  entities.set("sensor-temperature", {
    unique_id: "sensor-temperature",
    domain: "sensor",
    id: "temperature",
    name: "Temperature",
    state: "21.5",
    value: 21.5,
    icon: "mdi:thermometer",
    uom: "°C",
    device_class: "temperature",
    accuracy_decimals: 1,
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  // Humidity sensor
  entities.set("sensor-humidity", {
    unique_id: "sensor-humidity",
    domain: "sensor",
    id: "humidity",
    name: "Humidity",
    state: "48.2",
    value: 48.2,
    icon: "mdi:water-percent",
    uom: "%",
    device_class: "humidity",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  // Pressure sensor
  entities.set("sensor-pressure", {
    unique_id: "sensor-pressure",
    domain: "sensor",
    id: "pressure",
    name: "Atmospheric Pressure",
    state: "1013.25",
    value: 1013.25,
    icon: "mdi:gauge",
    uom: "hPa",
    device_class: "pressure",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  // Power sensor
  entities.set("sensor-power", {
    unique_id: "sensor-power",
    domain: "sensor",
    id: "power",
    name: "Power Consumption",
    state: "450",
    value: 450,
    icon: "mdi:flash",
    uom: "W",
    device_class: "power",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  // Energy sensor
  entities.set("sensor-energy", {
    unique_id: "sensor-energy",
    domain: "sensor",
    id: "energy",
    name: "Total Energy",
    state: "1234.56",
    value: 1234.56,
    icon: "mdi:lightning-bolt",
    uom: "kWh",
    device_class: "energy",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  // Voltage sensor
  entities.set("sensor-voltage", {
    unique_id: "sensor-voltage",
    domain: "sensor",
    id: "voltage",
    name: "Mains Voltage",
    state: "230.5",
    value: 230.5,
    icon: "mdi:sine-wave",
    uom: "V",
    device_class: "voltage",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  // CO2 sensor
  entities.set("sensor-co2", {
    unique_id: "sensor-co2",
    domain: "sensor",
    id: "co2",
    name: "CO₂ Level",
    state: "845",
    value: 845,
    icon: "mdi:molecule-co2",
    uom: "ppm",
    device_class: "carbon_dioxide",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  // PM2.5 sensor
  entities.set("sensor-pm25", {
    unique_id: "sensor-pm25",
    domain: "sensor",
    id: "pm25",
    name: "PM2.5",
    state: "12",
    value: 12,
    icon: "mdi:blur",
    uom: "µg/m³",
    device_class: "pm25",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  // Illuminance sensor
  entities.set("sensor-illuminance", {
    unique_id: "sensor-illuminance",
    domain: "sensor",
    id: "illuminance",
    name: "Light Level",
    state: "523",
    value: 523,
    icon: "mdi:brightness-5",
    uom: "lx",
    device_class: "illuminance",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  // Battery sensor
  entities.set("sensor-battery", {
    unique_id: "sensor-battery",
    domain: "sensor",
    id: "battery",
    name: "Battery Level",
    state: "87",
    value: 87,
    icon: "mdi:battery-80",
    uom: "%",
    device_class: "battery",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  // Sensor without unit
  entities.set("sensor-aqi", {
    unique_id: "sensor-aqi",
    domain: "sensor",
    id: "aqi",
    name: "Air Quality Index",
    state: "42",
    value: 42,
    icon: "mdi:air-filter",
    device_class: "aqi",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  // Diagnostic sensors
  entities.set("sensor-wifi_signal", {
    unique_id: "sensor-wifi_signal",
    domain: "sensor",
    id: "wifi_signal",
    name: "WiFi Signal",
    state: "-62",
    value: -62,
    icon: "mdi:wifi",
    uom: "dBm",
    device_class: "signal_strength",
    entity_category: 2,
    sorting_weight: weight++,
    sorting_group: "Diagnostic",
  });

  entities.set("sensor-uptime", {
    unique_id: "sensor-uptime",
    domain: "sensor",
    id: "uptime",
    name: "Uptime",
    state: "0",
    value: 0,
    icon: "mdi:clock-outline",
    uom: "s",
    device_class: "duration",
    entity_category: 2,
    sorting_weight: weight++,
    sorting_group: "Diagnostic",
  });

  entities.set("sensor-free_memory", {
    unique_id: "sensor-free_memory",
    domain: "sensor",
    id: "free_memory",
    name: "Free Memory",
    state: "142.5",
    value: 142.5,
    icon: "mdi:memory",
    uom: "kB",
    entity_category: 2,
    sorting_weight: weight++,
    sorting_group: "Diagnostic",
  });

  // =========================================================================
  // TEXT SENSORS
  // =========================================================================

  entities.set("text_sensor-version", {
    unique_id: "text_sensor-version",
    domain: "text_sensor",
    id: "version",
    name: "ESPHome Version",
    state: "2024.12.0",
    value: "2024.12.0",
    icon: "mdi:tag",
    entity_category: 2,
    sorting_weight: weight++,
    sorting_group: "Diagnostic",
  });

  entities.set("text_sensor-ip", {
    unique_id: "text_sensor-ip",
    domain: "text_sensor",
    id: "ip",
    name: "IP Address",
    state: "192.168.1.42",
    value: "192.168.1.42",
    icon: "mdi:ip-network",
    entity_category: 2,
    sorting_weight: weight++,
    sorting_group: "Diagnostic",
  });

  entities.set("text_sensor-ssid", {
    unique_id: "text_sensor-ssid",
    domain: "text_sensor",
    id: "ssid",
    name: "Connected WiFi",
    state: "HomeNetwork",
    value: "HomeNetwork",
    icon: "mdi:wifi",
    entity_category: 2,
    sorting_weight: weight++,
    sorting_group: "Diagnostic",
  });

  // =========================================================================
  // BINARY SENSORS - Various device classes
  // =========================================================================
  weight = 0;

  entities.set("binary_sensor-motion", {
    unique_id: "binary_sensor-motion",
    domain: "binary_sensor",
    id: "motion",
    name: "Motion Sensor",
    state: "OFF",
    value: false,
    icon: "mdi:motion-sensor",
    device_class: "motion",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  entities.set("binary_sensor-door", {
    unique_id: "binary_sensor-door",
    domain: "binary_sensor",
    id: "door",
    name: "Front Door",
    state: "OFF",
    value: false,
    icon: "mdi:door",
    device_class: "door",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  entities.set("binary_sensor-window", {
    unique_id: "binary_sensor-window",
    domain: "binary_sensor",
    id: "window",
    name: "Window Contact",
    state: "ON",
    value: true,
    icon: "mdi:window-open",
    device_class: "window",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  entities.set("binary_sensor-smoke", {
    unique_id: "binary_sensor-smoke",
    domain: "binary_sensor",
    id: "smoke",
    name: "Smoke Detector",
    state: "OFF",
    value: false,
    device_class: "smoke",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  entities.set("binary_sensor-water", {
    unique_id: "binary_sensor-water",
    domain: "binary_sensor",
    id: "water",
    name: "Water Leak Sensor",
    state: "OFF",
    value: false,
    device_class: "moisture",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  entities.set("binary_sensor-occupancy", {
    unique_id: "binary_sensor-occupancy",
    domain: "binary_sensor",
    id: "occupancy",
    name: "Room Occupied",
    state: "ON",
    value: true,
    device_class: "occupancy",
    sorting_weight: weight++,
    sorting_group: "Sensors",
  });

  entities.set("binary_sensor-connectivity", {
    unique_id: "binary_sensor-connectivity",
    domain: "binary_sensor",
    id: "connectivity",
    name: "API Connected",
    state: "ON",
    value: true,
    device_class: "connectivity",
    entity_category: 2,
    sorting_weight: weight++,
    sorting_group: "Diagnostic",
  });

  // =========================================================================
  // SWITCHES - Regular and assumed_state
  // =========================================================================
  weight = 0;

  entities.set("switch-relay1", {
    unique_id: "switch-relay1",
    domain: "switch",
    id: "relay1",
    name: "Relay 1",
    state: "ON",
    value: true,
    icon: "mdi:electric-switch",
    sorting_weight: weight++,
    sorting_group: "Controls",
  });

  entities.set("switch-relay2", {
    unique_id: "switch-relay2",
    domain: "switch",
    id: "relay2",
    name: "Relay 2",
    state: "OFF",
    value: false,
    icon: "mdi:electric-switch",
    sorting_weight: weight++,
    sorting_group: "Controls",
  });

  // assumed_state switch (no confirmation of state)
  entities.set("switch-rf_outlet", {
    unique_id: "switch-rf_outlet",
    domain: "switch",
    id: "rf_outlet",
    name: "RF Outlet",
    state: "OFF",
    value: false,
    icon: "mdi:power-socket",
    assumed_state: true,
    sorting_weight: weight++,
    sorting_group: "Controls",
  });

  entities.set("switch-led", {
    unique_id: "switch-led",
    domain: "switch",
    id: "led",
    name: "Status LED",
    state: "ON",
    value: true,
    icon: "mdi:led-on",
    entity_category: 1,
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  // =========================================================================
  // BUTTONS - Various device classes
  // =========================================================================

  entities.set("button-restart", {
    unique_id: "button-restart",
    domain: "button",
    id: "restart",
    name: "Restart",
    state: "",
    icon: "mdi:restart",
    device_class: "restart",
    entity_category: 1,
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  entities.set("button-safe_mode", {
    unique_id: "button-safe_mode",
    domain: "button",
    id: "safe_mode",
    name: "Safe Mode",
    state: "",
    icon: "mdi:shield-bug",
    entity_category: 2,
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  entities.set("button-factory_reset", {
    unique_id: "button-factory_reset",
    domain: "button",
    id: "factory_reset",
    name: "Factory Reset",
    state: "",
    icon: "mdi:backup-restore",
    entity_category: 1,
    is_disabled_by_default: true,
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  entities.set("button-identify", {
    unique_id: "button-identify",
    domain: "button",
    id: "identify",
    name: "Identify",
    state: "",
    icon: "mdi:crosshairs-question",
    device_class: "identify",
    sorting_weight: weight++,
    sorting_group: "Controls",
  });

  // =========================================================================
  // NUMBERS - Slider and box modes
  // =========================================================================
  weight = 0;

  // Slider mode (default)
  entities.set("number-brightness", {
    unique_id: "number-brightness",
    domain: "number",
    id: "brightness",
    name: "Default Brightness",
    state: "75 %",
    value: 75,
    icon: "mdi:brightness-6",
    min_value: "0",
    max_value: "100",
    step: "1",
    uom: "%",
    mode: 0,
    entity_category: 1,
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  // Slider with decimal step
  entities.set("number-offset", {
    unique_id: "number-offset",
    domain: "number",
    id: "offset",
    name: "Temperature Offset",
    state: "0.5 °C",
    value: 0.5,
    icon: "mdi:thermometer-alert",
    min_value: "-5",
    max_value: "5",
    step: "0.1",
    uom: "°C",
    mode: 0,
    entity_category: 1,
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  // Box mode (text input)
  entities.set("number-port", {
    unique_id: "number-port",
    domain: "number",
    id: "port",
    name: "MQTT Port",
    state: "1883",
    value: 1883,
    icon: "mdi:ethernet",
    min_value: "1",
    max_value: "65535",
    step: "1",
    mode: 1, // box mode
    entity_category: 1,
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  // =========================================================================
  // SELECTS
  // =========================================================================

  entities.set("select-preset", {
    unique_id: "select-preset",
    domain: "select",
    id: "preset",
    name: "Color Preset",
    state: "Warm White",
    value: "Warm White",
    icon: "mdi:palette",
    option: [
      "Warm White",
      "Cool White",
      "Daylight",
      "Reading",
      "Relax",
      "Night",
      "Custom",
    ],
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  entities.set("select-speed", {
    unique_id: "select-speed",
    domain: "select",
    id: "speed",
    name: "Animation Speed",
    state: "Medium",
    value: "Medium",
    icon: "mdi:speedometer",
    option: ["Slow", "Medium", "Fast"],
    entity_category: 1,
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  // =========================================================================
  // TEXT INPUTS
  // =========================================================================

  // Regular text
  entities.set("text-hostname", {
    unique_id: "text-hostname",
    domain: "text",
    id: "hostname",
    name: "Hostname",
    state: "esphome-device",
    value: "esphome-device",
    icon: "mdi:form-textbox",
    min_length: 1,
    max_length: 32,
    mode: 0, // text mode
    entity_category: 1,
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  // Password mode
  entities.set("text-api_key", {
    unique_id: "text-api_key",
    domain: "text",
    id: "api_key",
    name: "API Key",
    state: "••••••••",
    value: "secret123",
    icon: "mdi:key",
    min_length: 0,
    max_length: 64,
    mode: 1, // password mode
    entity_category: 1,
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  // =========================================================================
  // DATE / TIME / DATETIME
  // =========================================================================

  entities.set("date-schedule", {
    unique_id: "date-schedule",
    domain: "date",
    id: "schedule",
    name: "Schedule Date",
    state: "2024-12-25",
    value: "2024-12-25",
    icon: "mdi:calendar",
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  entities.set("time-alarm", {
    unique_id: "time-alarm",
    domain: "time",
    id: "alarm",
    name: "Alarm Time",
    state: "07:30:00",
    value: "07:30:00",
    icon: "mdi:alarm",
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  entities.set("datetime-next_run", {
    unique_id: "datetime-next_run",
    domain: "datetime",
    id: "next_run",
    name: "Next Scheduled Run",
    state: "2024-12-25 08:00:00",
    value: "2024-12-25 08:00:00",
    icon: "mdi:calendar-clock",
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  // =========================================================================
  // LOCKS
  // =========================================================================
  weight = 0;

  entities.set("lock-front", {
    unique_id: "lock-front",
    domain: "lock",
    id: "front",
    name: "Front Door Lock",
    state: "LOCKED",
    value: 0,
    icon: "mdi:lock",
    supports_open: true,
    sorting_weight: weight++,
    sorting_group: "Controls",
  });

  entities.set("lock-back", {
    unique_id: "lock-back",
    domain: "lock",
    id: "back",
    name: "Back Door Lock",
    state: "UNLOCKED",
    value: 1,
    icon: "mdi:lock-open",
    supports_open: false,
    sorting_weight: weight++,
    sorting_group: "Controls",
  });

  // =========================================================================
  // VALVES
  // =========================================================================

  // Simple on/off valve
  entities.set("valve-water_main", {
    unique_id: "valve-water_main",
    domain: "valve",
    id: "water_main",
    name: "Main Water Valve",
    state: "OPEN",
    value: 1.0,
    position: 1.0,
    icon: "mdi:pipe-valve",
    current_operation: "IDLE",
    supports_position: false,
    sorting_weight: weight++,
    sorting_group: "Controls",
  });

  // Valve with position
  entities.set("valve-irrigation", {
    unique_id: "valve-irrigation",
    domain: "valve",
    id: "irrigation",
    name: "Irrigation Zone 1",
    state: "CLOSED",
    value: 0.0,
    position: 0.0,
    icon: "mdi:sprinkler",
    current_operation: "IDLE",
    supports_position: true,
    sorting_weight: weight++,
    sorting_group: "Controls",
  });

  // =========================================================================
  // ALARM CONTROL PANEL
  // =========================================================================

  entities.set("alarm_control_panel-home", {
    unique_id: "alarm_control_panel-home",
    domain: "alarm_control_panel",
    id: "home",
    name: "Home Alarm",
    state: "DISARMED",
    value: 0,
    icon: "mdi:shield-home",
    requires_code: true,
    requires_code_to_arm: false,
    sorting_weight: weight++,
    sorting_group: "Controls",
  });

  // =========================================================================
  // EVENT ENTITIES
  // =========================================================================

  entities.set("event-doorbell", {
    unique_id: "event-doorbell",
    domain: "event",
    id: "doorbell",
    name: "Doorbell",
    state: "",
    icon: "mdi:doorbell",
    device_class: "doorbell",
    event_types: ["single_press", "double_press", "long_press"],
    sorting_weight: weight++,
    sorting_group: "Controls",
  });

  entities.set("event-button", {
    unique_id: "event-button",
    domain: "event",
    id: "button",
    name: "Physical Button",
    state: "",
    icon: "mdi:gesture-tap-button",
    device_class: "button",
    event_types: ["click", "double_click", "triple_click", "hold"],
    sorting_weight: weight++,
    sorting_group: "Controls",
  });

  // =========================================================================
  // UPDATE ENTITY
  // =========================================================================

  entities.set("update-firmware", {
    unique_id: "update-firmware",
    domain: "update",
    id: "firmware",
    name: "Firmware Update",
    state: "UPDATE AVAILABLE",
    icon: "mdi:package-up",
    current_version: "2024.11.0",
    latest_version: "2024.12.0",
    title: "ESPHome",
    summary: "Bug fixes and new features",
    release_url: "https://esphome.io/changelog/",
    in_progress: false,
    entity_category: 1,
    sorting_weight: weight++,
    sorting_group: "Configuration",
  });

  // =========================================================================
  // MEDIA PLAYER (if supported)
  // =========================================================================

  entities.set("media_player-speaker", {
    unique_id: "media_player-speaker",
    domain: "media_player",
    id: "speaker",
    name: "Smart Speaker",
    state: "IDLE",
    icon: "mdi:speaker",
    is_muted: false,
    volume: 0.5,
    sorting_weight: weight++,
    sorting_group: "Controls",
  });

  // =========================================================================
  // DEVICE-HIERARCHICAL ENTITIES (for URL testing)
  // =========================================================================

  entities.set("light-bedroom-ceiling", {
    unique_id: "light-bedroom-ceiling",
    domain: "light",
    id: "ceiling",
    device: "bedroom",
    name: "Bedroom Ceiling",
    state: "OFF",
    value: false,
    brightness: 255,
    color_mode: "brightness",
    supported_color_modes: ["brightness"],
    sorting_weight: weight++,
    sorting_group: "Lights",
  });

  entities.set("light-bedroom-lamp", {
    unique_id: "light-bedroom-lamp",
    domain: "light",
    id: "lamp",
    device: "bedroom",
    name: "Bedroom Lamp",
    state: "ON",
    value: true,
    brightness: 128,
    color_mode: "brightness",
    supported_color_modes: ["brightness"],
    sorting_weight: weight++,
    sorting_group: "Lights",
  });

  // =========================================================================
  // LAZY-LOADED ENTITIES (appear after 5 seconds)
  // =========================================================================

  lazyEntities.set("sensor-heap_free", {
    unique_id: "sensor-heap_free",
    domain: "sensor",
    id: "heap_free",
    name: "Heap Free",
    state: "85.3",
    value: 85.3,
    icon: "mdi:memory",
    uom: "kB",
    entity_category: 2,
    is_disabled_by_default: true,
    sorting_weight: 100,
    sorting_group: "Diagnostic",
  });

  lazyEntities.set("text_sensor-reset_reason", {
    unique_id: "text_sensor-reset_reason",
    domain: "text_sensor",
    id: "reset_reason",
    name: "Reset Reason",
    state: "Software reset CPU",
    value: "Software reset CPU",
    icon: "mdi:information",
    entity_category: 2,
    is_disabled_by_default: true,
    sorting_weight: 101,
    sorting_group: "Diagnostic",
  });
}

// ============================================================================
// Entity Lookup (supports device hierarchy)
// ============================================================================

function findEntity(
  domain: string,
  idOrDevice: string,
  maybeId?: string
): Entity | undefined {
  // Try device-prefixed key first
  if (maybeId) {
    const key = `${domain}-${idOrDevice}-${maybeId}`;
    if (entities.has(key)) return entities.get(key);
    if (lazyEntities.has(key)) return lazyEntities.get(key);
  }

  // Try simple key
  const simpleKey = `${domain}-${idOrDevice}`;
  if (entities.has(simpleKey)) return entities.get(simpleKey);
  if (lazyEntities.has(simpleKey)) return lazyEntities.get(simpleKey);

  return undefined;
}

// ============================================================================
// SSE Broadcasting
// ============================================================================

function sendSSE(
  res: ServerResponse,
  event: string,
  data: string,
  id?: string
) {
  let message = `event: ${event}\n`;
  if (id !== undefined) message += `id: ${id}\n`;
  message += `data: ${data}\n\n`;
  try {
    res.write(message);
  } catch {
    clients.delete(res);
  }
}

function broadcast(event: string, data: string, id?: string) {
  for (const client of clients) {
    sendSSE(client, event, data, id);
  }
}

// ============================================================================
// Logging
// ============================================================================

const logColors: Record<string, string> = {
  E: "\x1b[1;31m",
  W: "\x1b[0;33m",
  I: "\x1b[0;32m",
  C: "\x1b[0;35m",
  D: "\x1b[0;36m",
  V: "\x1b[0;37m",
};
const logReset = "\x1b[0m";

function logMessage(level: string, tag: string, lineNum: number, msg: string) {
  const color = logColors[level] || logColors.V;
  const line = `${color}[${level}][${tag}:${lineNum
    .toString()
    .padStart(3, "0")}]: ${msg}${logReset}`;
  broadcast("log", line);
}

const startupLogs = [
  {
    level: "I",
    tag: "app",
    line: 100,
    msg: "ESPHome version 2024.12.0 compiled on Jan 4 2026, 10:30:45",
  },
  { level: "C", tag: "wifi", line: 37, msg: "Setting up WiFi..." },
  { level: "I", tag: "wifi", line: 487, msg: "WiFi Connected!" },
  { level: "C", tag: "wifi", line: 286, msg: "  IP Address: 192.168.1.42" },
  { level: "C", tag: "wifi", line: 291, msg: "  Signal strength: -62 dB ▂▄▆█" },
  {
    level: "I",
    tag: "api",
    line: 147,
    msg: "API Server listening on port 6053",
  },
  { level: "I", tag: "app", line: 172, msg: "setup() finished successfully!" },
];

let startupLogIndex = 0;
function sendStartupLog() {
  if (startupLogIndex < startupLogs.length) {
    const log = startupLogs[startupLogIndex];
    logMessage(log.level, log.tag, log.line, log.msg);
    startupLogIndex++;
    setTimeout(sendStartupLog, 150);
  }
}

// ============================================================================
// Cover Animation
// ============================================================================

function animateCover(cover: CoverEntity, targetPosition: number) {
  if (cover._animating) return;
  cover._animating = true;

  const step = targetPosition > (cover.position || 0) ? 0.1 : -0.1;
  cover.current_operation = step > 0 ? "OPENING" : "CLOSING";
  broadcast("state", JSON.stringify(cover));

  const interval = setInterval(() => {
    const current = cover.position || 0;
    if (
      (step > 0 && current >= targetPosition) ||
      (step < 0 && current <= targetPosition)
    ) {
      cover.position = targetPosition;
      cover.value = targetPosition;
      cover.state = targetPosition === 0 ? "CLOSED" : "OPEN";
      cover.current_operation = "IDLE";
      cover._animating = false;
      clearInterval(interval);
      broadcast("state", JSON.stringify(cover));
    } else {
      cover.position = Math.round((current + step) * 100) / 100;
      cover.value = cover.position;
      cover.state = step > 0 ? "OPENING" : "CLOSING";
      broadcast("state", JSON.stringify(cover));
    }
  }, 200);
}

// ============================================================================
// Action Handlers
// ============================================================================

function handleAction(entity: Entity, action: string, params: URLSearchParams) {
  switch (entity.domain) {
    case "switch": {
      const sw = entity as SwitchEntity;
      if (action === "turn_on") {
        sw.state = "ON";
        sw.value = true;
      } else if (action === "turn_off") {
        sw.state = "OFF";
        sw.value = false;
      } else if (action === "toggle") {
        sw.state = sw.state === "ON" ? "OFF" : "ON";
        sw.value = sw.state === "ON";
      }
      logMessage("I", "switch", 89, `'${sw.name}' - Turned ${sw.state}`);
      break;
    }

    case "light": {
      const light = entity as LightEntity;
      if (action === "turn_on") {
        light.state = "ON";
        light.value = true;
        const brightness = params.get("brightness");
        if (brightness) light.brightness = parseInt(brightness);
        const r = params.get("r"),
          g = params.get("g"),
          b = params.get("b");
        if (r) light.r = parseInt(r);
        if (g) light.g = parseInt(g);
        if (b) light.b = parseInt(b);
        const w = params.get("w");
        if (w) light.w = parseInt(w);
        const colorTemp = params.get("color_temp");
        if (colorTemp) light.color_temp = parseInt(colorTemp);
        const effect = params.get("effect");
        if (effect) light.effect = effect;
        logMessage("I", "light", 145, `'${light.name}' - Turning ON`);
      } else if (action === "turn_off") {
        light.state = "OFF";
        light.value = false;
        logMessage("I", "light", 152, `'${light.name}' - Turning OFF`);
      } else if (action === "toggle") {
        light.state = light.state === "ON" ? "OFF" : "ON";
        light.value = light.state === "ON";
      }
      break;
    }

    case "fan": {
      const fan = entity as FanEntity;
      if (action === "turn_on") {
        fan.state = "ON";
        fan.value = true;
        const speedLevel = params.get("speed_level");
        if (speedLevel) fan.speed_level = parseInt(speedLevel);
        const oscillation = params.get("oscillation");
        if (oscillation) {
          fan.oscillation =
            oscillation === "TOGGLE" ? !fan.oscillation : oscillation === "ON";
        }
        const direction = params.get("direction");
        if (direction) fan.direction = direction;
        const preset = params.get("preset_mode");
        if (preset) fan.preset_mode = preset;
      } else if (action === "turn_off") {
        fan.state = "OFF";
        fan.value = false;
      } else if (action === "toggle") {
        fan.state = fan.state === "ON" ? "OFF" : "ON";
        fan.value = fan.state === "ON";
      }
      logMessage("I", "fan", 78, `'${fan.name}' - ${fan.state}`);
      break;
    }

    case "cover": {
      const cover = entity as CoverEntity;
      if (action === "open") {
        animateCover(cover, 1.0);
      } else if (action === "close") {
        animateCover(cover, 0.0);
      } else if (action === "stop") {
        cover._animating = false;
        cover.current_operation = "IDLE";
      } else if (action === "toggle") {
        animateCover(cover, cover.position === 0 ? 1.0 : 0.0);
      } else if (action === "set") {
        const position = params.get("position");
        if (position) animateCover(cover, parseFloat(position));
        const tilt = params.get("tilt");
        if (tilt) cover.tilt = parseFloat(tilt);
      }
      break;
    }

    case "lock": {
      const lock = entity as LockEntity;
      if (action === "lock") {
        lock.state = "LOCKED";
        lock.value = 0;
        lock.icon = "mdi:lock";
      } else if (action === "unlock") {
        lock.state = "UNLOCKED";
        lock.value = 1;
        lock.icon = "mdi:lock-open";
      } else if (action === "open") {
        lock.state = "UNLOCKED";
        lock.value = 1;
        lock.icon = "mdi:lock-open";
      }
      logMessage("I", "lock", 56, `'${lock.name}' - ${lock.state}`);
      break;
    }

    case "valve": {
      const valve = entity as ValveEntity;
      if (action === "open") {
        valve.state = "OPEN";
        valve.position = 1.0;
        valve.value = 1.0;
        valve.current_operation = "IDLE";
      } else if (action === "close") {
        valve.state = "CLOSED";
        valve.position = 0.0;
        valve.value = 0.0;
        valve.current_operation = "IDLE";
      } else if (action === "stop") {
        valve.current_operation = "IDLE";
      } else if (action === "toggle") {
        valve.state = valve.position === 0 ? "OPEN" : "CLOSED";
        valve.position = valve.position === 0 ? 1.0 : 0.0;
        valve.value = valve.position;
      } else if (action === "set") {
        const position = params.get("position");
        if (position) {
          valve.position = parseFloat(position);
          valve.value = valve.position;
          valve.state = valve.position > 0 ? "OPEN" : "CLOSED";
        }
      }
      logMessage("I", "valve", 42, `'${valve.name}' - ${valve.state}`);
      break;
    }

    case "button": {
      logMessage("I", "button", 45, `'${entity.name}' - Pressed`);
      if (entity.id === "restart") {
        logMessage("W", "app", 200, "Forcing a reboot...");
      }
      break;
    }

    case "number": {
      const num = entity as NumberEntity;
      if (action === "set") {
        const value = params.get("value");
        if (value) {
          const numValue = parseFloat(value);
          num.value = numValue;
          num.state = num.uom ? `${numValue} ${num.uom}` : value;
          logMessage("D", "number", 78, `'${num.name}' - Setting ${value}`);
        }
      }
      break;
    }

    case "select": {
      if (action === "set") {
        const option = params.get("option");
        if (option) {
          entity.state = option;
          entity.value = option;
          logMessage(
            "D",
            "select",
            54,
            `'${entity.name}' - Selected ${option}`
          );
        }
      }
      break;
    }

    case "text": {
      if (action === "set") {
        const value = params.get("value");
        if (value) {
          const decoded = decodeURIComponent(value);
          entity.value = decoded;
          const textEntity = entity as TextEntity;
          entity.state = textEntity.mode === 1 ? "••••••••" : decoded;
        }
      }
      break;
    }

    case "date":
    case "time":
    case "datetime": {
      if (action === "set") {
        const value = params.get("value");
        if (value) {
          entity.state = decodeURIComponent(value);
          entity.value = entity.state;
        }
      }
      break;
    }

    case "climate": {
      const climate = entity as ClimateEntity;
      if (action === "set") {
        const targetTemp = params.get("target_temperature");
        if (targetTemp) climate.target_temperature = parseFloat(targetTemp);
        const targetLow = params.get("target_temperature_low");
        if (targetLow) climate.target_temperature_low = parseFloat(targetLow);
        const targetHigh = params.get("target_temperature_high");
        if (targetHigh)
          climate.target_temperature_high = parseFloat(targetHigh);
        const mode = params.get("mode");
        if (mode) {
          climate.mode = mode.toUpperCase();
          // Update action based on mode
          if (climate.mode === "OFF") {
            climate.action = "OFF";
            climate.state = "OFF";
          } else if (climate.mode === "HEAT") {
            climate.action =
              climate.current_temperature! < (climate.target_temperature || 0)
                ? "HEATING"
                : "IDLE";
            climate.state = climate.action;
          } else if (climate.mode === "COOL") {
            climate.action =
              climate.current_temperature! > (climate.target_temperature || 0)
                ? "COOLING"
                : "IDLE";
            climate.state = climate.action;
          } else {
            climate.action = "IDLE";
            climate.state = climate.mode;
          }
        }
        const fanMode = params.get("fan_mode");
        if (fanMode) climate.fan_mode = fanMode.toUpperCase();
        const swingMode = params.get("swing_mode");
        if (swingMode) climate.swing_mode = swingMode.toUpperCase();
        const preset = params.get("preset");
        if (preset) climate.preset = preset.toUpperCase();
        logMessage(
          "D",
          "climate",
          178,
          `'${climate.name}' - Mode: ${climate.mode}, Target: ${climate.target_temperature}`
        );
      }
      break;
    }

    case "alarm_control_panel": {
      const alarm = entity as AlarmControlPanelEntity;
      if (action === "disarm") {
        alarm.state = "DISARMED";
        alarm.value = 0;
      } else if (action === "arm_away") {
        alarm.state = "ARMED_AWAY";
        alarm.value = 1;
      } else if (action === "arm_home") {
        alarm.state = "ARMED_HOME";
        alarm.value = 2;
      } else if (action === "arm_night") {
        alarm.state = "ARMED_NIGHT";
        alarm.value = 3;
      } else if (action === "arm_vacation") {
        alarm.state = "ARMED_VACATION";
        alarm.value = 4;
      }
      logMessage("I", "alarm", 89, `'${alarm.name}' - ${alarm.state}`);
      break;
    }

    case "update": {
      const upd = entity as UpdateEntity;
      if (action === "install") {
        upd.state = "INSTALLING";
        upd.in_progress = true;
        upd.progress = 0;
        broadcast("state", JSON.stringify(upd));
        logMessage(
          "I",
          "ota",
          125,
          `Starting OTA update to version ${upd.latest_version}`
        );

        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 10;
          upd.progress = progress;
          broadcast("state", JSON.stringify(upd));
          if (progress >= 100) {
            clearInterval(progressInterval);
            upd.state = "NO UPDATE";
            upd.current_version = upd.latest_version;
            upd.in_progress = false;
            broadcast("state", JSON.stringify(upd));
            logMessage("I", "ota", 198, "OTA update complete, restarting...");
          }
        }, 300);
      }
      break;
    }

    case "media_player": {
      const mp = entity as MediaPlayerEntity;
      if (action === "play") {
        mp.state = "PLAYING";
      } else if (action === "pause") {
        mp.state = "PAUSED";
      } else if (action === "stop") {
        mp.state = "IDLE";
      } else if (action === "mute") {
        mp.is_muted = !mp.is_muted;
      } else if (action === "set") {
        const volume = params.get("volume");
        if (volume) mp.volume = parseFloat(volume);
      }
      logMessage("I", "media", 67, `'${mp.name}' - ${mp.state}`);
      break;
    }
  }

  broadcast("state", JSON.stringify(entity));
}

// ============================================================================
// Simulation Loops
// ============================================================================

// Ping every 10 seconds
setInterval(() => {
  const uptime = Date.now() - startTime;
  broadcast("ping", "", `${uptime}`);
}, 10000);

// Sensor updates every 5 seconds
setInterval(() => {
  // Temperature fluctuation
  const temp = entities.get("sensor-temperature") as SensorEntity;
  if (temp) {
    const current = parseFloat(temp.state);
    const newVal = (current + (Math.random() - 0.5) * 0.3).toFixed(1);
    temp.state = newVal;
    temp.value = parseFloat(newVal);
    broadcast("state", JSON.stringify(temp));
  }

  // Humidity fluctuation
  const hum = entities.get("sensor-humidity") as SensorEntity;
  if (hum) {
    const current = parseFloat(hum.state);
    const newVal = Math.max(
      30,
      Math.min(70, current + (Math.random() - 0.5) * 2)
    ).toFixed(1);
    hum.state = newVal;
    hum.value = parseFloat(newVal);
    broadcast("state", JSON.stringify(hum));
  }

  // Power fluctuation
  const power = entities.get("sensor-power") as SensorEntity;
  if (power) {
    const newVal = Math.floor(400 + Math.random() * 100);
    power.state = newVal.toString();
    power.value = newVal;
    broadcast("state", JSON.stringify(power));
  }

  // Update uptime
  const uptime = entities.get("sensor-uptime") as SensorEntity;
  if (uptime) {
    const uptimeSec = Math.floor((Date.now() - startTime) / 1000);
    uptime.state = uptimeSec.toString();
    uptime.value = uptimeSec;
    broadcast("state", JSON.stringify(uptime));
  }

  // Climate state update
  const heater = entities.get("climate-heater") as ClimateEntity;
  if (heater && heater.mode === "HEAT") {
    // Slowly approach target
    const current = heater.current_temperature || 20;
    const target = heater.target_temperature || 22;
    if (current < target) {
      heater.current_temperature = Math.min(target, current + 0.1);
      heater.action = "HEATING";
    } else {
      heater.action = "IDLE";
    }
    heater.state = heater.action;
    broadcast("state", JSON.stringify(heater));
  }
}, 5000);

// Random binary sensor events
setInterval(() => {
  // Random motion detection
  const motion = entities.get("binary_sensor-motion") as BinarySensorEntity;
  if (motion && Math.random() > 0.7) {
    motion.state = motion.state === "ON" ? "OFF" : "ON";
    motion.value = motion.state === "ON";
    broadcast("state", JSON.stringify(motion));
    if (motion.state === "ON") {
      logMessage(
        "D",
        "binary_sensor",
        45,
        "'Motion Sensor' - Motion detected!"
      );
    }
  }
}, 8000);

// WiFi signal fluctuation every 30 seconds
setInterval(() => {
  const wifi = entities.get("sensor-wifi_signal") as SensorEntity;
  if (wifi) {
    const signal = -55 - Math.floor(Math.random() * 15);
    wifi.state = signal.toString();
    wifi.value = signal;
    broadcast("state", JSON.stringify(wifi));
  }

  const mem = entities.get("sensor-free_memory") as SensorEntity;
  if (mem) {
    const free = 130 + Math.random() * 30;
    mem.state = free.toFixed(1);
    mem.value = parseFloat(free.toFixed(1));
    broadcast("state", JSON.stringify(mem));
  }
}, 30000);

// Periodic log messages
setInterval(() => {
  const messages = [
    { level: "D", tag: "sensor", msg: "'Temperature' - Sending state 21.5 °C" },
    { level: "V", tag: "scheduler", msg: "Running scheduled job" },
    { level: "D", tag: "api", msg: "Client connected from 192.168.1.100" },
    { level: "D", tag: "light", msg: "'RGB Strip' - Setting brightness: 255" },
    {
      level: "V",
      tag: "component",
      msg: "Component sensor.temperature took 12ms",
    },
    { level: "D", tag: "switch", msg: "'Relay 1' - Sending state ON" },
    { level: "I", tag: "wifi", msg: "WiFi signal strength: -62 dB" },
    {
      level: "D",
      tag: "climate",
      msg: "'Room Heater' - Action changed: HEATING",
    },
    { level: "V", tag: "main", msg: "Loop time: 8ms" },
    { level: "D", tag: "cover", msg: "'Window Blinds' - Position: 75%" },
    {
      level: "W",
      tag: "sensor",
      msg: "'CO₂ Level' - Reading above threshold: 845 ppm",
    },
    { level: "D", tag: "fan", msg: "'Ceiling Fan' - Speed level: 2/4" },
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  logMessage(msg.level, msg.tag, Math.floor(Math.random() * 200), msg.msg);
}, 1500);

// ============================================================================
// Server
// ============================================================================

initEntities();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || "/", `http://localhost:${PORT}`);

    if (req.method === "OPTIONS") {
      res.writeHead(200, corsHeaders);
      res.end();
      return;
    }

    // --- SSE Events ---
    if (url.pathname === "/events") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...corsHeaders,
      });

      clients.add(res);

      const uptime = Date.now() - startTime;
      const config = JSON.stringify({
        title: "ESPHome Mock Device",
        comment: "Comprehensive Entity Test Server",
        ota: true,
        log: true,
        lang: "en",
      });
      sendSSE(res, "ping", config, `${uptime}`);

      // Send sorting groups
      for (const group of sortingGroups) {
        sendSSE(res, "sorting_group", JSON.stringify(group));
      }

      // Send all entities
      for (const entity of entities.values()) {
        sendSSE(res, "state", JSON.stringify(entity));
      }

      // Start sending startup logs
      setTimeout(sendStartupLog, 300);

      // Send lazy-loaded entities after 5 seconds
      setTimeout(() => {
        for (const entity of lazyEntities.values()) {
          entities.set(entity.unique_id, entity);
          broadcast("state", JSON.stringify(entity));
          logMessage(
            "D",
            "component",
            312,
            `Late-init component '${entity.name}' ready`
          );
        }
        lazyEntities.clear();
      }, 5000);

      req.on("close", () => {
        clients.delete(res);
      });

      return;
    }

    // --- OTA Update ---
    if (url.pathname === "/update" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        logMessage(
          "I",
          "ota",
          125,
          `OTA update received: ${body.length} bytes`
        );
        setTimeout(() => {
          logMessage("I", "ota", 145, "Writing firmware...");
          setTimeout(() => {
            logMessage("W", "ota", 198, "OTA update complete, restarting...");
            res.writeHead(200, corsHeaders);
            res.end("OK");
          }, 1500);
        }, 1000);
      });
      return;
    }

    // --- Entity Routes ---
    const pathParts = url.pathname.slice(1).split("/");

    if (pathParts.length >= 2) {
      const domain = pathParts[0];
      let entity: Entity | undefined;
      let action: string | undefined;

      // 4 parts: /domain/device/id/action
      if (pathParts.length === 4) {
        const [, device, id, act] = pathParts;
        entity = findEntity(domain, device, id);
        action = act;
      }
      // 3 parts: /domain/id/action OR /domain/device/id
      else if (pathParts.length === 3) {
        const [, idOrDevice, actionOrId] = pathParts;
        entity = findEntity(domain, idOrDevice);
        if (entity) {
          action = actionOrId;
        } else {
          entity = findEntity(domain, idOrDevice, actionOrId);
        }
      }
      // 2 parts: /domain/id (GET request)
      else if (pathParts.length === 2) {
        entity = findEntity(domain, pathParts[1]);
      }

      if (
        entity &&
        req.method === "GET" &&
        url.searchParams.get("detail") === "all"
      ) {
        res.writeHead(200, {
          "Content-Type": "application/json",
          ...corsHeaders,
        });
        res.end(JSON.stringify(entity));
        return;
      }

      if (entity && req.method === "POST" && action) {
        handleAction(entity, action, url.searchParams);
        res.writeHead(200, corsHeaders);
        res.end("OK");
        return;
      }
    }

    res.writeHead(404, corsHeaders);
    res.end("Not Found");
  }
);

server.listen(PORT, () => {
  const immediateCount = entities.size;
  const lazyCount = lazyEntities.size;
  console.log(`Mock ESPHome server running on http://localhost:${PORT}`);
  console.log(
    `Entities: ${immediateCount} immediate, ${lazyCount} lazy-loaded`
  );
  console.log("OTA enabled, device-aware routing enabled");
});
