import type { Sample } from './types';

/** Curvature as a function of arc length: kappa(s) in radians per unit. */
export type Kappa = (s: number) => number;

/**
 * Integrate curvature into a curve:  theta' = kappa,  (x,y)' = (cos, sin)(theta).
 * Smooth by construction (no kinks), so offset ribbons behave later.
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
    pts.push({ x, y, th, s });
    th += kappa(s) * step;
    x += Math.cos(th) * step;
    y += Math.sin(th) * step;
  }
  return pts;
}

/**
 * n alternating bends. `swing` is the peak heading deviation in radians
 * (~1 = a clear S). `taper` in [0,1] shrinks later bends for asymmetry.
 */
export function sineBends(n: number, swing: number, length: number, taper = 0, phase = 0): Kappa {
  const w = (2 * Math.PI * n) / length;
  return (s) => swing * w * Math.cos(w * s + phase) * (1 - taper * (s / length));
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

export const addKappa = (...ks: Kappa[]): Kappa => (s) => ks.reduce((sum, k) => sum + k(s), 0);
