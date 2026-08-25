// Server-Sent Events wiring. Ports the v3 protocol handling: config/uptime
// pings (with legacy firmware fallbacks), state merge with sparkline history,
// unknown-entity detail fetch with thresholds, sorting groups and log parsing.
import { base, detailUrl, domainOf } from "./api";
import {
  store,
  emit,
  CATEGORIES,
  UNCATEGORIZED,
  DOMAIN_ICON,
} from "./store";
import type { Entity } from "./store";

const HIST_MAX = 50;
// State events an unrecognised entity tolerates before a detail fetch - the
// device may still be about to send a detail_all event.
const UNKNOWN_THRESHOLD = 3;
// Cap per entity so a device that never describes it is not polled forever.
const UNKNOWN_ATTEMPTS = 3;

const unknowns: Record<string, { n: number; tries: number }> = {};
const pending = new Set<string>();

export function addEntity(data: any): void {
  const id: string = data.name_id || data.id;
  if (!id || store.entities.has(id)) return;
  const domain = data.domain || domainOf(id);
  const ent: Entity = {
    ...data,
    id,
    domain,
    state: data.state ?? "",
    sorting_group:
      data.sorting_group ?? CATEGORIES[Number(data.entity_category)] ?? UNCATEGORIZED,
    hist: typeof data.value === "number" ? [data.value] : [],
    has_action:
      domain in DOMAIN_ICON && domain !== "sensor" && domain !== "binary_sensor",
  };
  store.entities.set(id, ent);
  emit("entity", ent);
}

function handleState(e: MessageEvent) {
  const data = JSON.parse(e.data);
  const id: string = data.name_id || data.id;
  if (!id) return;
  const ent = store.entities.get(id);
  if (ent) {
    if (typeof data.value === "number") {
      ent.hist.push(data.value);
      if (ent.hist.length > HIST_MAX) ent.hist.shift();
    }
    for (const k of ["id", "name_id", "domain"]) delete data[k];
    Object.assign(ent, data);
    emit("state", ent);
    return;
  }
  // a detail_all event already carries name and domain
  if (data.name && data.domain) return addEntity(data);
  const u = (unknowns[id] ??= { n: 0, tries: 0 });
  if (++u.n < UNKNOWN_THRESHOLD || u.tries >= UNKNOWN_ATTEMPTS || pending.has(id))
    return;
  u.tries++;
  pending.add(id);
  fetch(detailUrl(id))
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then((d) => {
      delete unknowns[id];
      addEntity(d);
    })
    .catch((err) => console.error("detail fetch:", err))
    .finally(() => pending.delete(id));
}

function handleGroup(e: MessageEvent) {
  const g = JSON.parse(e.data);
  if (!g.name || store.groups.some((x) => x.name === g.name)) return;
  // the event carries { name, sorting_weight }
  store.groups.push({ name: g.name, weight: g.sorting_weight ?? 0 });
  store.groups.sort((a, b) => a.weight - b.weight);
  emit("groups");
}

function handlePing(e: MessageEvent) {
  // config on connect, uptime (seconds) on every ping; legacy firmware that
  // sends empty pings is handled via the lastEventId fallback below.
  if (e.data?.length) {
    const d = JSON.parse(e.data);
    if (d.title !== undefined) {
      store.title = d.title;
      store.comment = d.comment ?? "";
      store.ota = !!d.ota;
      store.logging = d.log !== false;
      emit("config");
    }
    if (d.uptime !== undefined) {
      store.uptime = d.uptime * 1000; // seconds -> ms, overflow-safe
      emit("uptime");
    } else if (e.lastEventId) {
      store.uptime = parseInt(e.lastEventId);
      emit("uptime");
    }
  } else if (e.lastEventId) {
    store.uptime = parseInt(e.lastEventId);
    emit("uptime");
  }
  store.connected = true;
  store.lastSeen = Date.now();
  emit("conn");
}

// Log lines arrive with an ANSI color prefix that encodes the level.
const LOG_TYPES: Record<string, string> = {
  "\u001b[1;31m": "e",
  "\u001b[0;33m": "w",
  "\u001b[0;32m": "i",
  "\u001b[0;35m": "c",
  "\u001b[0;36m": "d",
  "\u001b[0;37m": "v",
};

function handleLog(e: MessageEvent) {
  const d: string = e.data;
  const type = LOG_TYPES[d.slice(0, 7)];
  if (!type) return;
  const lines = d.slice(7, -4).split("\n");
  const first = lines[0];
  const level = first.slice(0, 3);
  const tag = first.slice(3).split(":").slice(0, 2).join(":");
  emit("log", {
    type,
    level,
    tag,
    when: new Date().toTimeString().split(" ")[0],
    lines: [first.slice(5 + tag.length), ...lines.slice(1)],
  });
}

export function connect(): void {
  store.lastSeen = Date.now();
  const es = new EventSource(base() + "/events");
  (window as any).source = es; // exposed like v3 for debugging/tests
  es.addEventListener("ping", handlePing as EventListener);
  es.addEventListener("state", handleState as EventListener);
  es.addEventListener("sorting_group", handleGroup as EventListener);
  es.addEventListener("log", handleLog as EventListener);
  es.addEventListener("error", () => {
    store.connected = false;
    emit("conn");
  });
  // 30s heartbeat: SSE reconnects on its own, we only reflect the state
  setInterval(() => {
    const ok = Date.now() - store.lastSeen < 15000;
    if (ok !== store.connected) {
      store.connected = ok;
      emit("conn");
    }
  }, 5000);
}
