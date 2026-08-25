// Minimal typed template helper: interpolations are escaped by default,
// trusted markup is passed through via Html instances (html() output or raw()).
import { ICONS } from "../ui/icons";

export class Html extends String {}

const MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const esc = (v: unknown): string =>
  String(v).replace(/[&<>"']/g, (c) => MAP[c]);

// The Html brand exists only at build time to keep the escaper honest;
// publicly everything is a plain string so innerHTML assignments just work.
export const html = (s: TemplateStringsArray, ...v: unknown[]): string => {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    out += s[i];
    if (i >= v.length) break;
    const x = v[i];
    out += x instanceof Html ? x
      : Array.isArray(x)
        ? x.map((y) => (y instanceof Html ? y : y == null ? "" : esc(y))).join("")
      : x == null || x === false ? "" : esc(x);
  }
  return new Html(out) as unknown as string;
};

export const raw = (s: string): string => new Html(s) as unknown as string;

// Inline SVG icon. The ICONS table (built from icons.json) works offline;
// any other mdi: icon is lazy-fetched from the iconify API like v3 did and
// patched into every rendered instance via its data-i marker. Offline or
// unknown names fall back to information-outline.
const fetched = new Map<string, string>();
const pending = new Set<string>();

const svg = (key: string, d: string, cls: string): string =>
  raw(
    `<svg class="ic${cls ? " " + cls : ""}" viewBox="0 0 24 24" aria-hidden="true"><path data-i="${key}" d="${d}"/></svg>`
  );

const lazy = (key: string): void => {
  if (pending.has(key)) return;
  pending.add(key);
  fetch(`https://api.iconify.design/mdi/${key}.svg`)
    .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
    .then((t) => {
      const d = / d="([^"]+)"/.exec(t)?.[1];
      if (!d) throw new Error("no path");
      fetched.set(key, d);
      document
        .querySelectorAll<SVGPathElement>(`path[data-i="${key}"]`)
        .forEach((p) => p.setAttribute("d", d));
    })
    .catch(() => {});
};

// Keys in ICONS omit the "mdi:" prefix.
export const icon = (name: string, cls = ""): string => {
  const key = name.slice(name.indexOf(":") + 1);
  const d = ICONS[key] ?? fetched.get(key);
  if (d) return svg(key, d, cls);
  lazy(key);
  return svg(key, ICONS["information-outline"], cls);
};
