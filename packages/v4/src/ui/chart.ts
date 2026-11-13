// Hand-rolled SVG sparkline: smooth curve through every point, a dot marker
// on each reading, max/min labels in the 42px strip and a full nice-step
// tick scale when expanded. Renders in pixel space so dots stay round.
// Vertical inset (px): keeps curve/dots/labels clear of the edges so peaks
// never look cut off when the chart expands.
const INSET = 9;
// Chart.js-style smoothing: control offset = neighbour delta * tension / 3
const TENSION = 0.3;
const DOT = 3;

interface Pt {
  x: number;
  y: number;
}

export class EChart extends HTMLElement {
  data: number[] = [];
  w = 0;
  h = 0;
  private ro?: ResizeObserver;

  connectedCallback(): void {
    this.ro = new ResizeObserver((es) => {
      const r = es[0].contentRect;
      const w = Math.round(r.width);
      const h = Math.round(r.height);
      if (w !== this.w || h !== this.h) {
        this.w = w;
        this.h = h;
        this.draw();
      }
    });
    this.ro.observe(this);
  }

  disconnectedCallback(): void {
    this.ro?.disconnect();
    this.ro = undefined;
  }

  set series(v: number[]) {
    this.data = v ?? [];
    this.draw();
  }

  private values(): number[] {
    return this.data.filter(Number.isFinite);
  }

  // Skip until the ResizeObserver reported the real size: drawing in the
  // 100x100 fallback distorts geometry and clips the dots at the extremes.
  private draw(): void {
    if (!this.w || !this.h) return;
    const values = this.values();
    const w = this.w || 100;
    const h = this.h || 100;
    const min = values.length ? Math.min(...values) : 0;
    const span = values.length ? Math.max(...values) - min : 0;
    const step = values.length > 1 ? w / (values.length - 1) : 0;
    const pts: Pt[] = values.map((v, i) => ({
      x: values.length > 1 ? i * step : w / 2,
      y: INSET + (1 - (span > 0 ? (v - min) / span : 0.5)) * (h - 2 * INSET),
    }));
    // Catmull-Rom converted to cubic beziers
    let d = pts.length ? `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}` : "";
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      // Clamp the control points to the segment's y range so the curve can
      // never overshoot the data extremes (they would get clipped).
      const lo = Math.min(p1.y, p2.y);
      const hi = Math.max(p1.y, p2.y);
      const c1x = p1.x + ((p2.x - p0.x) * TENSION) / 3;
      const c1y = Math.min(hi, Math.max(lo, p1.y + ((p2.y - p0.y) * TENSION) / 3));
      const c2x = p2.x - ((p3.x - p1.x) * TENSION) / 3;
      const c2y = Math.min(hi, Math.max(lo, p2.y - ((p3.y - p1.y) * TENSION) / 3));
      d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    }
    const dots = pts
      .map((p) => `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${DOT}"/>`)
      .join("");
    this.innerHTML =
      `<svg viewBox="0 0 ${w} ${h}"><path d="${d}"/>${dots}</svg>` +
      this.ticks(values, min, span, h);
  }

  // "Nice" 1/2/5 x 10^n tick step, like the Chart.js linear scale.
  private nice(span: number, maxTicks: number): number {
    const raw = span / maxTicks;
    const mag = 10 ** Math.floor(Math.log10(raw));
    const n = raw / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * mag;
  }

  private label(v: number): string {
    return String(Number(v.toPrecision(4)));
  }

  private ticks(values: number[], min: number, span: number, h: number): string {
    if (!values.length) return "";
    const yOf = (v: number) =>
      INSET + (1 - (span > 0 ? (v - min) / span : 0.5)) * (h - 2 * INSET);
    const max = min + span;
    const fmt = (v: number, y: number) =>
      `<span style="top:${y.toFixed(1)}px">${this.label(v)}</span>`;
    if (h <= 100 || span === 0) {
      return `<div class="axis">${
        span === 0 ? fmt(min, yOf(min)) : fmt(max, yOf(max)) + fmt(min, yOf(min))
      }</div>`;
    }
    const step = this.nice(span, 10);
    let out = "";
    for (let t = Math.ceil(min / step) * step; t <= max + step * 1e-6; t += step) {
      out += fmt(t, yOf(t));
    }
    return `<div class="axis">${out}</div>`;
  }
}

customElements.define("e-chart", EChart);
