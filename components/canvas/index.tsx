"use client";
import { CanvasControls } from "./Controls";
import { CanvasEdges } from "./Edges";
import { CanvasNodes } from "./Nodes";
import { useCanvas } from "./useCanvas";
import { CanvasData } from "./types";
import { CanvasProvider } from "./Context";
import { Loader2 } from "lucide-react";
import { CanvasToolbar } from "./Toolbar";
const initialCanvas: CanvasData = {
  nodes: [
    {
      id: "1",
      type: "text",
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      label: "Text Node",
      text: "This is a text node",
      color: "4", // green
    },
    {
      id: "2",
      type: "file",
      x: 400,
      y: 100,
      width: 200,
      height: 100,
      label: "File Node",
      file: "/file.svg",
      color: "5", // cyan
    },
    {
      id: "3",
      type: "sticky",
      x: 100,
      y: 300,
      width: 200,
      height: 100,
      label: "Sticky Node",
      text: "This is a sticky node",
      color: "6", // purple
    },
  ],
  edges: [
    {
      id: "e1-2",
      fromNode: "1",
      toNode: "2",
      fromSide: "right",
      toSide: "left",
    },
  ],
};

export function Canvas() {
  return (
    <CanvasProvider initialData={initialCanvas}>
      <CanvasContent />
    </CanvasProvider>
  );
}

function CanvasContent() {
  const { canvas, canvasRef, loading } = useCanvas();
  const { viewport } = canvas;

  return (
    <div
      className="fixed inset-0 h-full w-full overflow-hidden"
      style={
        {
          "--scale": viewport.scale,
          "--pan-x": `${viewport.panOffsetX}px`,
          "--pan-y": `${viewport.panOffsetY}px`,
        } as React.CSSProperties
      }
    >
      <div
        id="canvas"
        ref={canvasRef}
        className="h-full w-full"
        style={{
          backgroundImage:
            "radial-gradient(var(--border) calc(var(--scale)*0.5px + 0.5px), transparent 0)",
          backgroundSize: "calc(var(--scale) * 20px) calc(var(--scale) * 20px)",
          backgroundPosition:
            "calc(var(--pan-x) - 19px) calc(var(--pan-y) - 19px)",
        }}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <>
            <CanvasNodes />
          </>
        )}
        <CanvasControls />
        <CanvasToolbar />
        {/* <div className="absolute left-0 right-0 p-4 size-[400px] overflow-scroll">
          <pre>{JSON.stringify(viewport, null, 2)}</pre>
        </div> */}
      </div>
    </div>
  );
}
