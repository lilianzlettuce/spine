import { useEffect, useRef } from "react";
import { useStore } from "../state/store";
import { renderScene } from "../render/renderScene";
import { useCanvas } from "../hooks/useCanvas";
import type { Pt } from "../core/types";

export function CanvasView() {
  const scene = useStore((s) => s.scene); // generated data
  const light = useStore((s) => s.light);
  const regenerate = useStore((s) => s.regenerate);
  const generateFromStroke = useStore((s) => s.generateFromStroke);

  const isMouseDown = useRef(false);
  const currentCurve = useRef<Pt[]>([]);

  const { canvasRef, requestRedraw } = useCanvas((ctx, w, h) => {
    renderScene(ctx, scene, { w, h, light });
  });

  useEffect(() => {
    requestRedraw();
  }, [scene, light]);

  // Handle mouse events
  const handleMouseMove = () => {
    if (!canvasRef.current) return;

    // Calculate mouse position relative to canvas on viewport
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    //console.log(mouseX, mouseY);

    // Draw line if mouse down
    if (isMouseDown.current) {
      currentCurve.current.push({ x: mouseX, y: mouseY });
    }
  };

  const handleMouseDown = () => {
    isMouseDown.current = true;
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
    console.log(currentCurve.current);
    generateFromStroke(currentCurve.current); // generate new growth from user input stroke
    currentCurve.current = []; // reset curve array
    //regenerate();
  };

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
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
}
