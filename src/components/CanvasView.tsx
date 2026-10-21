import { useEffect } from "react";
import { useStore } from "../state/store";
import { renderScene } from "../render/renderScene";
import { useCanvas } from "../hooks/useCanvas";

export function CanvasView() {
  const scene = useStore((s) => s.scene); // generated data
  const light = useStore((s) => s.light);

  const { ref, requestRedraw } = useCanvas((ctx, w, h) => {
    renderScene(ctx, scene, { w, h, light });
  });

  useEffect(() => {
    requestRedraw();
  }, [scene, light]);

  return <canvas ref={ref} style={{ width: "100%", height: "100%" }} />;
}
