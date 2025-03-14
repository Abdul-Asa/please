"use client";
import { useCanvas } from "./useCanvas";
import { FileNode, Node, StickyNode, TextNode } from "./types";
import { cn } from "@/lib/utils";
import { NODE_CONSTANTS } from "./constants";
import {
  FileIcon,
  StickyNoteIcon,
  TypeIcon,
  Trash2Icon,
  ImageIcon,
  MaximizeIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
const FileNodeContent = dynamic(
  () => import("./FileNode").then((mod) => mod.FileNodeContent),
  {
    ssr: false,
  }
);
export function CanvasNodes() {
  const { canvas } = useCanvas();
  const { nodes, viewport } = canvas;

  return (
    <div
      style={{
        transform: `translate(${viewport.panOffsetX}px, ${viewport.panOffsetY}px) scale(${viewport.scale})`,
        transformOrigin: "left top",
      }}
    >
      {nodes.map((node) => (
        <CanvasNode key={node.id} node={node} />
      ))}
    </div>
  );
}

function CanvasNode({ node }: { node: Node }) {
  const {
    canvas: { viewport },
    dragHandlers: { startNodeDrag },
    controls: { deleteNode, updateNode, resetToDefaultView, resetView },
  } = useCanvas();

  const isSelected = viewport.selectedNodeId === node.id;
  const isLastSelected = viewport.lastSelectedNodeId === node.id;
  const isPanMode = viewport.panMode;
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deleteNode(node.id);
  };

  const handleLabelChange = (e: React.FocusEvent<HTMLSpanElement>) => {
    const newLabel = e.currentTarget.textContent?.trim();
    if (!newLabel) {
      // Reset to original label if empty
      e.currentTarget.textContent = node.label || node.type;
      return;
    }
    if (newLabel !== node.label) {
      updateNode(node.id, { label: newLabel });
    }
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    e.stopPropagation();

    if (e.key === "Enter") {
      e.preventDefault();
      const content = e.currentTarget.textContent?.trim();
      if (!content) {
        // Reset to original label if empty
        e.currentTarget.textContent = node.label || node.type;
      }
      e.currentTarget.blur();
    }
  };

  return (
    <motion.div
      draggable={false}
      className={cn(
        "absolute group rounded-md border-2 border-primary-light bg-background flex flex-col",
        !isPanMode && "hover:shadow-sm",
        isSelected && "border-ring"
      )}
      style={{
        minWidth: node.width,
        minHeight: node.height,
        zIndex: isExpanded ? 50 : isLastSelected ? 10 : "auto",
        maxWidth: isExpanded ? "none" : NODE_CONSTANTS.MAX_NODE_WIDTH,
        maxHeight: isExpanded ? "none" : NODE_CONSTANTS.MAX_NODE_HEIGHT,
      }}
      initial={false}
      animate={
        isExpanded
          ? {
              left: -viewport.panOffsetX / viewport.scale + 16,
              top: -viewport.panOffsetY / viewport.scale + 72,
              height: "calc(100vh - 5.6rem)",
              width: "calc(100vw - 2rem)",
            }
          : {
              left: node.x,
              top: node.y,
              height: "fit-content",
              width: "fit-content",
            }
      }
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 35,
        mass: 1.2,
        duration: viewport.isDragging || viewport.isPanning ? 0 : 0.4,
      }}
    >
      <div
        className={cn(
          "flex items-center justify-between p-0.5 border-b shrink-0",
          !isPanMode && "cursor-grab active:cursor-grabbing"
        )}
        onMouseDown={(e) => !isPanMode && startNodeDrag(e, node.id)}
      >
        <div className="flex items-center">
          {node.type === "text" && <TypeIcon size={16} className="mx-2" />}
          {node.type === "file" && node.fileType === "image" && (
            <ImageIcon size={16} className="mx-2" />
          )}
          {node.type === "file" && node.fileType !== "image" && (
            <FileIcon size={16} className="mx-2" />
          )}
          {node.type === "sticky" && (
            <StickyNoteIcon size={16} className="mx-2" />
          )}
          <div className="h-6 w-px bg-border mx-0.5"></div>
          <div className="flex items-center ml-2 gap-2 max-w-[200px]">
            <span
              contentEditable={!isPanMode}
              suppressContentEditableWarning
              onBlur={handleLabelChange}
              onKeyDown={handleLabelKeyDown}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              className="text-sm line-clamp-1 w-full font-medium cursor-text outline-none focus:border-b border-ring px-1"
            >
              {node.label || node.type}
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <Button
            variant={"ghost"}
            size={"icon"}
            className={cn(isPanMode && "invisible")}
            onClick={() => {
              // if (isExpanded) {
              //   resetView();
              // } else {
              //   resetToDefaultView();
              // }
              resetToDefaultView();
              setIsExpanded(!isExpanded);
            }}
            title="Expand node"
          >
            <MaximizeIcon />
          </Button>
          <Button
            variant={"ghost"}
            size={"icon"}
            className={cn(
              "hover:text-destructive/80",
              isPanMode && "invisible"
            )}
            onClick={handleDelete}
            title="Delete node"
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>
      <div className="p-2 overflow-auto flex-1 max-h-[calc(400px-2.5rem)]">
        {node.type === "text" && <TextNodeContent node={node as TextNode} />}
        {node.type === "file" && <FileNodeContent node={node as FileNode} />}
        {node.type === "sticky" && (
          <StickyNodeContent node={node as StickyNode} />
        )}
      </div>
    </motion.div>
  );
}

function TextNodeContent({ node }: { node: TextNode }) {
  return (
    <div className="h-full">
      <p>{node.text}</p>
    </div>
  );
}

function StickyNodeContent({ node }: { node: StickyNode }) {
  return (
    <div className="h-full">
      <p>{node.text}</p>
    </div>
  );
}
