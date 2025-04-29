"use client";
import { useCanvas } from "../useCanvas";
import { FileNode, Node, TextNode } from "../types";
import { cn } from "@/lib/utils";
import { NODE_CONSTANTS } from "../constants";
import {
  FileIcon,
  TypeIcon,
  Trash2Icon,
  ImageIcon,
  MaximizeIcon,
  BoxIcon,
} from "lucide-react";
import { Button } from "../../ui/button";
import { motion } from "motion/react";
import { TextNodeContent } from "./TextNode";
import { FileNodeContent } from "./FileNode";
import { MultiplayerNodes } from "../multiplayer/nodes";

export function CanvasNodes({ isMultiplayer }: { isMultiplayer?: boolean }) {
  const { canvas } = useCanvas();
  const { nodes, viewport } = canvas;

  return isMultiplayer ? (
    <MultiplayerNodes />
  ) : (
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
    controls: { deleteNode, updateNode, resetToDefaultView, updateViewport },
  } = useCanvas();

  const isSelected = viewport.selectedNodeId === node.id;
  const isLastSelected = viewport.lastSelectedNodeId === node.id;
  const isPanMode = viewport.panMode;
  const isExpanded = viewport.expandedNodeId === node.id;

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
        "absolute node group rounded-md border-2 border-border bg-background  dark:bg-[#1e0516] flex flex-col",
        !isPanMode && "hover:shadow-sm",
        isSelected && "border-ring"
      )}
      layout
      layoutId={`${node.id}-container`}
      style={{
        minWidth: isExpanded ? "0px" : node.width,
        minHeight: node.height,
        zIndex: isExpanded ? 100 : isLastSelected ? 10 : "auto",
        maxWidth: isExpanded ? "none" : NODE_CONSTANTS.MAX_NODE_WIDTH,
        maxHeight: isExpanded ? "none" : NODE_CONSTANTS.MAX_NODE_HEIGHT,
        height: isExpanded
          ? "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 2rem)"
          : "auto",
        width: isExpanded
          ? "calc(100dvw - env(safe-area-inset-left) - env(safe-area-inset-right) - 2rem)"
          : "max-content",
        left: isExpanded ? -viewport.panOffsetX / viewport.scale + 16 : node.x,
        top: isExpanded ? -viewport.panOffsetY / viewport.scale + 16 : node.y,
      }}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 35,
        mass: 1.2,
        duration:
          viewport.isDragging || viewport.isPanning || viewport.isScrolling
            ? 0
            : 0.4,
      }}
    >
      <div
        className={cn(
          "flex items-center justify-between p-0.5 border-b shrink-0 border-border",
          !isPanMode && "cursor-grab active:cursor-grabbing"
        )}
        onMouseDown={(e) => !isPanMode && startNodeDrag(e, node.id)}
      >
        <motion.div
          layout="position"
          layoutId={`${node.id}-label`}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 35,
            mass: 1.2,
            duration:
              viewport.isDragging || viewport.isPanning || viewport.isScrolling
                ? 0
                : 0.4,
          }}
          className="flex items-center"
        >
          {node.type === "text" && <TypeIcon size={16} className="mx-2" />}
          {node.type === "file" && node.fileType === "image" && (
            <ImageIcon size={16} className="mx-2" />
          )}
          {node.type === "file" && node.fileType !== "image" && (
            <FileIcon size={16} className="mx-2" />
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
          <Button
            size={"icon"}
            variant={"ghost"}
            className={cn((!viewport.vrFrom || isPanMode) && "invisible")}
            onClick={() => {
              updateViewport({
                is3D: viewport.vrFrom,
                expandedNodeId: node.id,
                vrFrom: null,
              });
            }}
            tooltip="Return back to VR"
          >
            <BoxIcon className="animate-bounce" />
          </Button>
        </motion.div>
        <motion.div
          layoutId={`${node.id}-controls`}
          layout="position"
          className="flex items-center"
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 35,
            mass: 1.2,
            duration:
              viewport.isDragging || viewport.isPanning || viewport.isScrolling
                ? 0
                : 0.4,
          }}
        >
          <Button
            variant={"ghost"}
            size={"icon"}
            className={cn(isPanMode && "invisible")}
            onClick={() => {
              resetToDefaultView();
              if (isExpanded) {
                updateViewport({ expandedNodeId: "" });
              } else {
                updateViewport({ expandedNodeId: node.id });
              }
            }}
            tooltip="Expand node"
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
            tooltip="Delete node"
          >
            <Trash2Icon />
          </Button>
        </motion.div>
      </div>
      {node.type === "text" && <TextNodeContent node={node as TextNode} />}
      {node.type === "file" && <FileNodeContent node={node as FileNode} />}
    </motion.div>
  );
}
