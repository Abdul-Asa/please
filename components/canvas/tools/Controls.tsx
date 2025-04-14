"use client";
import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  RotateCcw,
  Move,
  Box,
  Keyboard,
  Search,
} from "lucide-react";
import { useCanvas } from "../useCanvas";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { motion } from "motion/react";
import { NodeManager } from "../dialogs/NodeManager";
import { CodeManager } from "../dialogs/CodeManager";
import { DebugDialog } from "../dialogs/DebugDialog";
import { VRCanvas } from "../3d";

export function CanvasControls() {
  const { controls, canvas } = useCanvas();
  const { zoomIn, zoomOut, resetView, togglePanMode, resetToDefaultView } =
    controls;
  const { panMode, scale, expandedNodeId } = canvas.viewport;
  const isExpanded = expandedNodeId !== "";

  return (
    <motion.div
      initial={{ y: isExpanded ? -100 : 0, x: 0 }}
      animate={{ y: isExpanded ? -100 : 0, x: 0 }}
      exit={{ y: -100, x: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <div className="absolute bottom-4 lg:bottom-auto lg:top-4 left-4 flex items-center gap-1 rounded-md bg-background/60 border border-border px-2 py-1.5 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={zoomOut}
          tooltip="Zoom Out"
          tooltipSide="bottom"
        >
          <Minus size={18} />
        </Button>

        <div
          className="min-w-[4.5rem] px-2 text-center text-sm cursor-pointer"
          onClick={resetToDefaultView}
          title="Reset Zoom"
        >
          {Math.round(scale * 100)}%
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={zoomIn}
          tooltip="Zoom In"
          tooltipSide="bottom"
        >
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
          tooltip="Toggle Pan Mode"
          tooltipSide="bottom"
        >
          <Move size={18} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={resetView}
          tooltip="Reset View"
          tooltipSide="bottom"
        >
          <RotateCcw size={18} />
        </Button>
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-1 rounded-md bg-background/60 border border-border px-2 py-1.5 backdrop-blur-sm">
        <NodeManager />
        <CodeManager />
        <VRCanvas />
        <div className="h-6 w-px bg-border mx-1"></div>
        <ModeToggle />
        <DebugDialog />
      </div>
    </motion.div>
  );
}
