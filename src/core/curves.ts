import type { Sample } from "./types";

/** Curvature (how sharply curve turns) as a function of arc length
 * kappa(s) in radians per unit of distance */
export type Kappa = (s: number) => number;

/**
 * Integrate curvature into a curve:  theta' = kappa,  (x,y)' = (cos, sin)(theta).
 * Smooth by construction (no kinks), so offset ribbons behave later.
 * @param {Kappa} kappa - curvature
 */
export function curveFromCurvature(
  kappa: Kappa,
  length: number,
  origin: { x: number; y: number; th: number },
  step = 4,
): Sample[] {
  const pts: Sample[] = [];
  let { x, y, th } = origin;
  for (let s = 0; s <= length; s += step) {
    pts.push({ x, y, th, s }); // record where we are, which way we face, how far we've come
    th += kappa(s) * step; // turn by (turn rate) × (distance covered)
    x += Math.cos(th) * step; // move `step` units in the new heading
    y += Math.sin(th) * step;
  }
  return pts;
}

/**
 * n alternating bends. `swing` is the peak heading deviation in radians
 * (~1 = a clear S). `taper` in [0,1] shrinks later bends for asymmetry.
 */
export function sineBends(
  n: number,
  swing: number,
  length: number,
  taper = 0,
  phase = 0,
): Kappa {
  const w = (2 * Math.PI * n) / length;
  return (s) =>
    swing * w * Math.cos(w * s + phase) * (1 - taper * (s / length));
}

/** Clothoid tail: curvature ramps up linearly over the last `frac` of the curve. */
export function hookTail(length: number, frac: number, turn: number): Kappa {
  const len = length * frac;
  const start = length - len;
  const rate = (2 * turn) / (len * len); // total turning = rate * len^2 / 2
  return (s) => (s > start ? (s - start) * rate : 0);
}

/** Gaussian bump of curvature: a deliberate, localized turn. */
export function bump(center: number, width: number, amount: number): Kappa {
  return (s) => amount * Math.exp(-((s - center) ** 2) / (2 * width * width));
}

export const addKappa =
  (...ks: Kappa[]): Kappa =>
  (s) =>
    ks.reduce((sum, k) => sum + k(s), 0);

// Get curve samples from any array of points (for user-drawn input)
export function samplesFromStroke(raw: Pt[], step = 4): Sample[] {
  // 1. smooth: a few passes of a 3-point moving average (keep the endpoints)
  let p = raw;
  for (let pass = 0; pass < 3; pass++) {
    p = p.map((q, i) => {
      if (i === 0 || i === p.length - 1) return q;
      return {
        x: (p[i - 1].x + q.x + p[i + 1].x) / 3,
        y: (p[i - 1].y + q.y + p[i + 1].y) / 3,
      };
    });
  }

  // 2. resample at even spacing by walking along the polyline
  const out: Pt[] = [p[0]];
  let carry = 0; // distance since the last output point
  for (let i = 1; i < p.length; i++) {
    let a = p[i - 1];
    const b = p[i];
    let segLen = Math.hypot(b.x - a.x, b.y - a.y);
    while (carry + segLen >= step) {
      const u = (step - carry) / segLen;
      a = { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
      out.push(a);
      segLen = Math.hypot(b.x - a.x, b.y - a.y);
      carry = 0;
    }
    carry += segLen;
  }

  // 3. compute heading and arc length for each point
  return out.map((q, i) => {
    const next = out[Math.min(i + 1, out.length - 1)];
    const prev = out[Math.max(i - 1, 0)];
    return {
      x: q.x,
      y: q.y,
      th: Math.atan2(next.y - prev.y, next.x - prev.x),
      s: i * step,
    };
  });
}
