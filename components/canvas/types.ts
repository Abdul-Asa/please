export type NodeType = "text" | "file" | "sticky";
export type FileType = "image" | "pdf" | "text";

interface BaseNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  label?: string;
}

export interface TextNode extends BaseNode {
  type: "text";
  text: string;
}

export interface FileNode extends BaseNode {
  type: "file";
  file: string;
  fileType: FileType;
}

export interface StickyNode extends BaseNode {
  type: "sticky";
  text: string;
}

export type Node = TextNode | FileNode | StickyNode;

export interface CanvasColor {
  "1": string;
  "2": string;
  "3": string;
  "4": string;
  "5": string;
  "6": string;
}

export const colors: CanvasColor = {
  "1": "#ef4444", // red
  "2": "#f97316", // orange
  "3": "#eab308", // yellow
  "4": "#22c55e", // green
  "5": "#06b6d4", // cyan
  "6": "#a855f7", // purple
};

export interface Viewport {
  scale: number;
  panOffsetX: number;
  panOffsetY: number;
  panStartX: number;
  panStartY: number;
  isDragging: boolean;
  isPanning: boolean;
  selectedNodeId: string;
  lastSelectedNodeId: string;
  expandedNodeId: string;
  panMode: boolean;
  dragState: {
    startX: number;
    startY: number;
    initialNodeX: number;
    initialNodeY: number;
  };
}

export interface CanvasData {
  nodes: Node[];
  viewport?: Viewport;
}

export interface FileContent {
  id: string;
  name: string;
  type: string;
  content: string | ArrayBuffer;
  size: number;
  lastModified: number;
}

export interface CanvasContextType {
  initialData: CanvasData | null;
}
