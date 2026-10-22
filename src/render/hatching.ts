/**
 * Hatching for shading/contour
 * Draw regular short strokes ACROSS the ribbon (along the normal)
 * Start from whichever edge is turned away from the light, reach inward only as far as the surface is dark
 *
 * Call this while ribbon polygon is set as clip region to keep edges in
 */
import { hash01, noise1 } from "./noise";
import { normalOf, tangentOf, type Ribbon } from "./ribbon";

const STEPS = 8; // how many samples we walk across half the ribbon
const THRESH = 0.55; // darkness above this gets hatched
const ELEV = 0.55; // light elevation above the page (rad). Higher = flatter, brighter
const SIN_E = Math.sin(ELEV);
const COS_E = Math.cos(ELEV);

/**
 * Fake lighting for a tube seen from above.
 * @param {number} v  - position across the ribbon: -1 (-normal edge), 0 (spine), +1 (+normal edge)
 * @param {number} nl - dot(normal light direction on the page) at this spot along the spine
 *
 * Cylinder's surface normal at v = (normal*v, sqrt(1-v^2))
 * 3D light vector =  (lightDir x cosE, sinE)
 * @return {number} - 0: lit, 1 - dark
 */
function darkness(v: number, nl: number): number {
  const lit = v * nl * COS_E + Math.sqrt(Math.max(0, 1 - v * v)) * SIN_E;
  return 1 - Math.min(1, Math.max(0, lit));
}

export function hatchRibbon(
  ctx: CanvasRenderingContext2D,
  r: Ribbon,
  o: { light: number; unit: number; px: number; seed: number },
) {
  // Direction TOWARD the light angle on the page
  const Lx = Math.cos(o.light);
  const Ly = Math.sin(o.light);

  const { spine, width } = r;
  const step = spine.length > 1 ? spine[1].s - spine[0].s : 4;
  const stride = Math.max(1, Math.round((6 * o.unit) / step)); // samples between hatches

  ctx.beginPath(); // all hatches go into ONE path, stroked once (much faster)

  for (
    let i = 0;
    i < spine.length;
    i += stride + (hash01(i, o.seed) > 0.75 ? 1 : 0)
  ) {
    // ^ every so often skip an extra sample, so spacing isn't machine-regular
    const w = width[i];
    if (w < 2 * o.unit) continue; // too thin to hatch (near the tip)

    const p = spine[i];
    const n = normalOf(p);
    const t = tangentOf(p);
    const half = w / 2;
    const nl = n.x * Lx + n.y * Ly; // >0: +normal side faces the light

    // Try both edges. Each one hatches inward while the surface is still dark.
    for (const side of [1, -1]) {
      let reach = 0; // how far in from this edge (0-1 of the half-width) is dark
      for (let k = 1; k <= STEPS; k++) {
        const v = side * (1 - k / STEPS);
        if (darkness(v, nl) < THRESH) break;
        reach = k / STEPS;
      }
      if (reach === 0) continue; // this edge is lit: no hatching here

      // Alter length so hatch ends don't form a clean line
      reach = Math.min(1, reach * (1 + 0.25 * noise1(i * 0.9, o.seed + side)));

      const slant = 0.5 * half * reach; // lean strokes along the curve, like a right-handed hand
      // start slightly outside the edge, end inside
      const ox = p.x + n.x * side * half * 1.15;
      const oy = p.y + n.y * side * half * 1.15;
      const ix = p.x + n.x * side * half * (1 - reach) + t.x * slant;
      const iy = p.y + n.y * side * half * (1 - reach) + t.y * slant;
      ctx.moveTo(ox, oy);
      ctx.lineTo(ix, iy);
    }
  }

  ctx.lineWidth = 0.9 * o.px;
  ctx.lineCap = "round";
  ctx.stroke();
}

export function hatchToContour(
  ctx: CanvasRenderingContext2D,
  r: Ribbon,
  o: { light: number; unit: number; px: number; seed: number },
) {
  // Direction TOWARD the light angle on the page
  const Lx = Math.cos(o.light);
  const Ly = Math.sin(o.light);

  const { spine, width } = r;
  const step = spine.length > 1 ? spine[1].s - spine[0].s : 4;
  const stride = Math.max(1, Math.round((6 * o.unit) / step)); // samples between hatches

  ctx.beginPath(); // all hatches go into ONE path, stroked once (much faster)

  for (
    let i = 0;
    i < spine.length;
    i += stride + (hash01(i, o.seed) > 0.75 ? 1 : 0)
  ) {
    // ^ every so often skip an extra sample, so spacing isn't machine-regular
    const w = width[i];
    if (w < 2 * o.unit) continue; // too thin to hatch (near the tip)

    const p = spine[i];
    const n = normalOf(p);
    const t = tangentOf(p);
    const half = w / 2;
    const nl = n.x * Lx + n.y * Ly; // >0: +normal side faces the light

    // Try both edges. Each one hatches inward while the surface is still dark
    for (const side of [1, -1]) {
      let reach = 0; // how far in from this edge (0-1 of the half-width) is dark
      for (let k = 1; k <= STEPS; k++) {
        const v = side * (1 - k / STEPS);
        if (darkness(v, nl) < THRESH) break;
        reach = k / STEPS;
      }
      if (reach === 0) continue; // this edge is lit: no hatching here

      // Alter length so hatch ends don't form a clean line
      reach = Math.min(1, reach * (1 + 0.25 * noise1(i * 0.9, o.seed + side)));

      const slant = 0.5 * half * reach; // lean strokes along the curve, like a right-handed hand
      // start slightly outside the edge, end inside
      const ox = p.x + n.x * side * half * 1.15;
      const oy = p.y + n.y * side * half * 1.15;
      const ix = p.x + n.x * side * half * (1 - reach) + t.x * slant;
      const iy = p.y + n.y * side * half * (1 - reach) + t.y * slant;
      ctx.moveTo(ox, oy);
      ctx.lineTo(ix, iy);
    }
  }

  ctx.lineWidth = 0.9 * o.px;
  ctx.lineCap = "round";
  ctx.stroke();
}
