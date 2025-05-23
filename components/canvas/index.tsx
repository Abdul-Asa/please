"use client";
import { CanvasNodes } from "./node";
import { useCanvas } from "./useCanvas";
import { Loader2 } from "lucide-react";
import { CanvasSidebar } from "./tools/Sidebar";
import { CanvasControls } from "./tools/Controls";
import VRCanvas from "./3d/VRcanvas";
import { MultiplayerCursors } from "./multiplayer/cursor";

export function Canvas({ isMultiplayer }: { isMultiplayer: boolean }) {
  const { canvas, canvasRef, loading } = useCanvas();
  const { viewport } = canvas;

  return viewport.is3D ? (
    <VRCanvas />
  ) : (
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
          <CanvasNodes isMultiplayer={isMultiplayer} />
        )}
        <CanvasSidebar isMultiplayer={isMultiplayer} />
        <CanvasControls isMultiplayer={isMultiplayer} />
      </div>
      {isMultiplayer && viewport.expandedNodeId === "" && (
        <MultiplayerCursors />
      )}
    </div>
  );
}
