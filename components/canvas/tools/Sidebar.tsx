"use client";

import { Button } from "@/components/ui/button";
import { TypeIcon } from "lucide-react";
import { useCanvas } from "../useCanvas";
import { motion } from "motion/react";
import { AddCodeDialog } from "../dialogs/AddCodeDialog";
import { AddFileDialog } from "../dialogs/AddFileDialog";

export function CanvasSidebar() {
  const { canvas, controls } = useCanvas();
  const { addTextNode } = controls;
  const isExpanded = canvas.viewport.expandedNodeId !== "";

  return (
    <motion.div
      className="absolute left-4 top-1/2 flex flex-col items-center gap-4 p-2 bg-background/60 backdrop-blur-sm rounded-sm border border-border shadow-sm z-[40]"
      initial={{ x: isExpanded ? -100 : 0, y: "-50%" }}
      animate={{ x: isExpanded ? -100 : 0, y: "-50%" }}
      exit={{ x: -100, y: "-50%" }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      {/* Text node */}
      <Button
        variant="outline"
        size="icon"
        onClick={addTextNode}
        aria-label="Add text"
        tooltip="Add text node"
        tooltipSide="right"
      >
        <TypeIcon size={20} />
      </Button>

      {/* Add File */}
      <AddFileDialog />

      {/* Add Code */}
      <AddCodeDialog />
    </motion.div>
  );
}
