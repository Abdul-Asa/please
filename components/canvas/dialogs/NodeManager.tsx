"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FolderOpen, TypeIcon, FileIcon } from "lucide-react";
import { useCanvas } from "../useCanvas";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function NodeManager() {
  const { canvas, controls } = useCanvas();
  const { nodes, viewport } = canvas;
  const { updateViewport } = controls;
  const [open, setOpen] = useState(false);

  const scrollToNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Calculate the center of the node
    const nodeCenterX = node.x + node.width / 2;
    const nodeCenterY = node.y + node.height / 2;

    // Calculate the viewport center
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate the new pan offset to center the node
    const newPanOffsetX = viewportWidth / 2 - nodeCenterX * viewport.scale;
    const newPanOffsetY = viewportHeight / 2 - nodeCenterY * viewport.scale;

    updateViewport({
      panOffsetX: newPanOffsetX,
      panOffsetY: newPanOffsetY,
      selectedNodeId: nodeId,
      lastSelectedNodeId: nodeId,
    });

    // Close the sheet
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          tooltip="Node Manager"
          tooltipSide="bottom"
        >
          <FolderOpen size={18} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Node Manager</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {nodes.map((node) => (
            <Button
              variant={"outline"}
              key={node.id}
              onClick={() => scrollToNode(node.id)}
              className={cn(
                "w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors",
                viewport.selectedNodeId === node.id && "bg-accent"
              )}
            >
              {node.type === "text" ? (
                <TypeIcon size={16} />
              ) : (
                <FileIcon size={16} />
              )}
              <span className="truncate">{node.label}</span>
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
