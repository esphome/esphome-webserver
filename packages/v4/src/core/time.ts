// "14 hours ago" style formatting for the uptime display.
const UNITS = [
  ["year", 31557600e3],
  ["month", 2592000e3],
  ["week", 604800e3],
  ["day", 86400e3],
  ["hour", 3600e3],
  ["minute", 60e3],
  ["second", 1e3],
] as const;

export const relative = (ms: number): string => {
  if (!ms) return "now";
  for (const [unit, size] of UNITS) {
    if (Math.abs(ms) >= size)
      return new Intl.RelativeTimeFormat("en").format(
        Math.round(ms / size),
        unit as Intl.RelativeTimeFormatUnit
      );
  }
  return "now";
};
