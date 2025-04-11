"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
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
  const { scrollToNode } = controls;
  const [open, setOpen] = useState(false);

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
      <SheetContent side="right" className="sm:w-[400px] w-[calc(100vw-2rem)]">
        <SheetHeader>
          <SheetTitle>Node Manager</SheetTitle>
          <SheetDescription>
            Manage your nodes and their associated theme marks.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {nodes.map((node) => (
            <Button
              variant={"outline"}
              key={node.id}
              onClick={() => {
                scrollToNode(node.id);
                setOpen(false);
              }}
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
