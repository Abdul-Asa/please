"use client";
import { useCanvas } from "./useCanvas";
import { FileNode, Node, StickyNode, TextNode } from "./types";
import { cn } from "@/lib/utils";
import {
  FileIcon,
  StickyNoteIcon,
  TypeIcon,
  Trash2Icon,
  ImageIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import dynamic from "next/dynamic";

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
    controls: { deleteNode },
  } = useCanvas();

  const isSelected = viewport.selectedNodeId === node.id;
  const isLastSelected = viewport.lastSelectedNodeId === node.id;
  const isPanMode = viewport.panMode;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deleteNode(node.id);
  };

  return (
    <div
      draggable={false}
      className={cn(
        "absolute rounded-md border-2 border-primary-light bg-background",
        !isPanMode && "hover:shadow-sm",
        isSelected && "border-ring",
        isLastSelected && "z-10",
        "group"
      )}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
      }}
    >
      <div
        className={cn(
          "flex items-center justify-between p-0.5 border-b",
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
          <div className="flex items-center ml-2 gap-2">
            <p className="text-sm font-medium">{node.label || node.type}</p>
          </div>
        </div>
        {!isPanMode && (
          <Button
            variant={"ghost"}
            size={"icon"}
            className="hover:text-destructive/80"
            onClick={handleDelete}
            title="Delete node"
          >
            <Trash2Icon />
          </Button>
        )}
      </div>
      <div className="p-2 h-[calc(100%-2.5rem)] overflow-auto">
        {node.type === "text" && <TextNodeContent node={node as TextNode} />}
        {node.type === "file" && <FileNodeContent node={node as FileNode} />}
        {node.type === "sticky" && (
          <StickyNodeContent node={node as StickyNode} />
        )}
      </div>
    </div>
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
