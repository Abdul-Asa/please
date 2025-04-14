import { useCanvas } from "../useCanvas";

export function VR() {
  const { canvas, controls } = useCanvas();

  return (
    <div>
      VRCanvas {canvas.viewport.is3D}
      <button onClick={() => controls.updateViewport({ is3D: null })}>
        Back
      </button>
    </div>
  );
}
