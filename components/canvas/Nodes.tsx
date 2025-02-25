"use client";
import { useCanvas } from "./useCanvas";
import { FileNode, Node, StickyNode, TextNode } from "./types";
import { cn } from "@/lib/utils";
import { FileIcon, StickyNoteIcon, TypeIcon } from "lucide-react";

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
  } = useCanvas();

  const isSelected = viewport.selectedNodeId === node.id;
  const isLastSelected = viewport.lastSelectedNodeId === node.id;

  return (
    <div
      draggable={false}
      className={cn(
        "absolute rounded-lg border-2 border-primary-light bg-background shadow-sm hover:shadow-md group",
        isSelected && "border-primary-dark",
        isLastSelected && "z-10"
      )}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
      }}
    >
      <div
        className="flex items-center justify-between p-2 border-b cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => startNodeDrag(e, node.id)}
      >
        <div className="flex items-center gap-2">
          {node.type === "text" && <TypeIcon className="w-4 h-4" />}
          {node.type === "file" && <FileIcon className="w-4 h-4" />}
          {node.type === "sticky" && <StickyNoteIcon className="w-4 h-4" />}
          <p className="text-sm font-medium">{node.label || node.type}</p>
        </div>
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

function FileNodeContent({ node }: { node: FileNode }) {
  return (
    <iframe src={node.file} className="w-full h-full" title={node.label} />
  );
}

function StickyNodeContent({ node }: { node: StickyNode }) {
  return (
    <div className="h-full">
      <p>{node.text}</p>
    </div>
  );
}
