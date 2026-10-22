import type { Scene } from "../core/types";

export interface RenderOpts {
  w: number;
  h: number;
  light: number; // radians; reserved for hatching
  showJoints: boolean;
  padding?: number;
  view?: ViewTransform; // skip auto-fit if given
}

export interface ViewTransform {
  k: number; // scale
  tx: number; // transform x
  ty: number; // transform y
}

const PAPER = "#f1ebdd";
const INK = "#1b1a17";
const WIDTH = [2.4, 1.5, 0.9]; // px per level (debug)

// Fit scene bbox into the canvas. Returned transform is for future hit-testing
export function fitTransform(
  scene: Scene,
  w: number,
  h: number,
  pad = 40,
): ViewTransform {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const c of scene.curves)
    for (const p of c.pts) {
      x0 = Math.min(x0, p.x);
      y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x);
      y1 = Math.max(y1, p.y);
    }
  const bw = Math.max(1, x1 - x0),
    bh = Math.max(1, y1 - y0);
  const k = Math.min((w - pad * 2) / bw, (h - pad * 2) / bh);
  return { k, tx: (w - bw * k) / 2 - x0 * k, ty: (h - bh * k) / 2 - y0 * k };
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  o: RenderOpts,
): ViewTransform {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, o.w, o.h);

  const v = o.view ? o.view : fitTransform(scene, o.w, o.h, o.padding);
  ctx.save();
  ctx.translate(v.tx, v.ty);
  ctx.scale(v.k, v.k);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = INK;

  // Draw deepest level first so the main flow sits on top
  const ordered = [...scene.curves].sort((a, b) => b.level - a.level);
  for (const c of ordered) {
    ctx.lineWidth = (WIDTH[c.level] ?? 0.7) / v.k; // scale based on size
    ctx.beginPath();
    c.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
  }

  // Show joints
  if (o.showJoints) {
    ctx.fillStyle = INK;
    for (const j of scene.joints) {
      ctx.beginPath();
      ctx.arc(j.x, j.y, 3 / v.k, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  return v;
}
