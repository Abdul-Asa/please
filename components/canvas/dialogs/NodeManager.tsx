"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  TypeIcon,
  FileIcon,
  Plus,
  Trash2,
  Link,
  X,
} from "lucide-react";
import { useCanvas } from "../useCanvas";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function NodeManager() {
  const { canvas, controls } = useCanvas();
  const { nodes, viewport } = canvas;
  const { scrollToNode, deleteNode, addTextNode, getCodeSelections } = controls;
  const [open, setOpen] = useState(false);

  const handleDeleteAll = () => {
    nodes.forEach((node) => deleteNode(node.id));
    controls.resetToDefaultView();
    setOpen(false);
  };

  const getSelectionCount = (nodeId: string) => {
    let count = 0;
    canvas.codes.forEach((code) => {
      const selections = getCodeSelections(code.id);
      count += selections.filter((s) => s.nodeId === nodeId).length;
    });
    return count;
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
      <SheetContent side="right" className="sm:w-[400px] w-[calc(100vw-2rem)]">
        <SheetHeader>
          <SheetTitle>Node Manager</SheetTitle>
          <SheetDescription>
            Manage your nodes and their associated theme marks.
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-2 mt-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              addTextNode();
              setOpen(false);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Node
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  nodes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll}>
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="space-y-2 mt-4 overflow-y-auto h-[calc(100vh-220px)]">
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <div
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md",
                  viewport.selectedNodeId === node.id && "bg-accent"
                )}
              >
                {node.type === "text" ? (
                  <TypeIcon size={16} className="text-muted-foreground" />
                ) : (
                  <FileIcon size={16} className="text-muted-foreground" />
                )}
                <div className="flex-1 flex items-center justify-between gap-1 min-w-0">
                  <span className="truncate block">{node.label}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground">
                          ({getSelectionCount(node.id)})
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getSelectionCount(node.id) > 0
                          ? `${getSelectionCount(node.id)} selections`
                          : "No selections"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    tooltip="Scroll to Node"
                    onClick={() => {
                      scrollToNode(node.id);
                      setOpen(false);
                    }}
                  >
                    <Link size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => deleteNode(node.id)}
                    tooltip="Delete Node"
                  >
                    <X size={16} className="text-destructive" />
                  </Button>
                </div>
              </div>
              {index < nodes.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
