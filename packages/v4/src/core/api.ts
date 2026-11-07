import type { Entity } from "./store";

// Entity IDs: "domain/name" or "domain/device/name" (v3+ firmware).
export const base = (): string => {
  const p = location.pathname;
  return p.endsWith("/") ? p.slice(0, -1) : p;
};

export const domainOf = (id: string): string => id.split("/")[0];

// action may embed a query ("set?away=true")
export const actionUrl = (ent: Entity, action: string): string => {
  const [path, query] = action.split("?");
  const dev = ent.device ? `${encodeURIComponent(ent.device)}/` : "";
  const url = `${base()}/${ent.domain}/${dev}${encodeURIComponent(
    ent.name
  )}/${path}`;
  return query ? `${url}?${query}` : url;
};

export const detailUrl = (id: string): string =>
  `${base()}/${id.split("/").map(encodeURIComponent).join("/")}?detail=all`;

export const post = (url: string, body?: string): void => {
  fetch(url, {
    method: "POST",
    headers: body
      ? { "Content-Type": "application/x-www-form-urlencoded" }
      : undefined,
    body,
  }).catch((e) => console.error("action failed:", e));
};
