"use client";
import { CanvasControls } from "./tools/Controls";
import { CanvasNodes } from "./node/Nodes";
import { useCanvas } from "./useCanvas";
import { Loader2 } from "lucide-react";
import { CanvasToolbar } from "./tools/Toolbar";
import { CanvasContextType, CanvasData } from "./types";
import { createContext, ReactNode } from "react";

// Context for the canvas
export const CanvasContext = createContext<CanvasContextType | null>(null);
function CanvasProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: CanvasData | null;
}) {
  return (
    <CanvasContext.Provider value={{ initialData }}>
      {children}
    </CanvasContext.Provider>
  );
}

export function Canvas() {
  return (
    <CanvasProvider initialData={null}>
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
            "radial-gradient(hsl(var(--border)) calc(var(--scale)*0.5px + 0.5px), transparent 0)",
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
          <CanvasNodes />
        )}
        <CanvasControls />
        <CanvasToolbar />
        {/* <div className="absolute left-0 bottom-0 p-4 size-[400px] overflow-scroll pointer-events-none">
          <pre>{JSON.stringify(canvas.nodes, null, 2)}</pre>
        </div> */}
      </div>
    </div>
  );
}
