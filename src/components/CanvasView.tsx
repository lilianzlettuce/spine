import { useEffect, useRef } from "react";
import { useStore } from "../state/store";
import { renderScene } from "../render/renderScene";
import { useCanvas } from "../hooks/useCanvas";
import type { Pt } from "../core/types";

export function CanvasView() {
  const { scene, light, showJoints, drawMode, generateFromStroke } = useStore();

  // User drawing vars
  const isMouseDown = useRef(false);
  const currentCurve = useRef<Pt[]>([]);

  const { canvasRef, requestRedraw } = useCanvas((ctx, w, h) => {
    renderScene(ctx, scene, {
      w,
      h,
      light,
      showJoints: true,
      view: drawMode === "draw" ? { k: 1, tx: 0, ty: 0 } : undefined,
    });

    // live preview of the stroke while the pointer is down
    if (isMouseDown.current && currentCurve.current.length > 1) {
      ctx.strokeStyle = "#1b1a17";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      currentCurve.current.forEach((p, i) =>
        i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y),
      );
      ctx.stroke();
    }
  });

  useEffect(() => {
    requestRedraw();
  }, [scene, light, showJoints, drawMode, generateFromStroke]);

  // Calculate mouse position in canvas
  const pos = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  /* Event handlers */

  const handleMouseLeave = () => {
    isMouseDown.current = false;
  };

  // Handle touch events for mobile
  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    lastMouseMoveTime.current = Date.now();
    isDragging.current = true;

    const touch = event.touches[0];
    if (!touch || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    updatePixels(touchX, touchY);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    lastMouseMoveTime.current = Date.now();

    event.preventDefault();
    const touch = event.touches[0];
    if (!touch || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    updatePixels(touchX, touchY);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    lastMouseMoveTime.current = Date.now();
    updatePixels(-100, -100);
  };

  return (
    <canvas
      className="border-solid border-1 border-gray-200"
      ref={canvasRef}
      style={{ width: "100%", height: "100%" }}
      onPointerDown={(e) => {
        if (drawMode !== "draw") return;
        e.currentTarget.setPointerCapture(e.pointerId);
        isMouseDown.current = true;
        currentCurve.current = [pos(e)];
        requestRedraw();
      }}
      onPointerMove={(e) => {
        if (!canvasRef.current || !isMouseDown.current) return;

        // Draw line if mouse down
        currentCurve.current.push(pos(e));
        requestRedraw();
      }}
      onPointerUp={() => {
        if (!isMouseDown.current) return;
        isMouseDown.current = false;
        console.log(currentCurve.current);
        generateFromStroke(currentCurve.current); // generate new growth from user input stroke
        currentCurve.current = []; // reset curve array
        //regenerate();
      }}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
}
