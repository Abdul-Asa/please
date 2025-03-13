"use client";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RotateCcw, Move, Box } from "lucide-react";
import { useCanvas } from "./useCanvas";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../ui/mode-toggle";

export function CanvasControls() {
  const { controls, canvas } = useCanvas();
  const { zoomIn, zoomOut, resetView, togglePanMode } = controls;
  const { panMode, scale } = canvas.viewport;

  return (
    <>
      <div className="absolute top-4 left-4 flex items-center gap-1 rounded-md bg-background/90 border border-border px-2 py-1.5 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={zoomOut} title="Zoom Out">
          <Minus size={18} />
        </Button>

        <div
          className="min-w-[4.5rem] px-2 text-center text-sm cursor-pointer"
          onClick={resetView}
          title="Reset Zoom"
        >
          {Math.round(scale * 100)}%
        </div>

        <Button variant="ghost" size="icon" onClick={zoomIn} title="Zoom In">
          <Plus size={18} />
        </Button>

        <div className="h-6 w-px bg-border mx-1"></div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "border border-transparent",
            panMode && "border-primary"
          )}
          onClick={togglePanMode}
          title="Toggle Pan Mode"
        >
          <Move size={18} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={resetView}
          title="Reset View"
        >
          <RotateCcw size={18} />
        </Button>
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-1 rounded-md bg-background/90 border border-border px-2 py-1.5 backdrop-blur-sm">
        <Button variant="ghost" size="icon" title="Toggle Grid">
          <Box size={18} />
        </Button>
        <div className="h-6 w-px bg-border mx-1"></div>
        <ModeToggle />
      </div>
    </>
  );
}
