import { Editor, JSONContent } from "@tiptap/react";

export type NodeType = "text" | "file";
export type FileType = "image" | "pdf" | "text";

interface BaseNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  editor?: Editor;
  vrText?: JSONContent;
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

export type Node = TextNode | FileNode;

export interface Viewport {
  is3D: "VR" | "AR" | "3D" | null;
  scale: number;
  panOffsetX: number;
  panOffsetY: number;
  panStartX: number;
  panStartY: number;
  isDragging: boolean;
  isPanning: boolean;
  isScrolling: boolean;
  selectedNodeId: string;
  lastSelectedNodeId: string;
  expandedNodeId: string;
  panMode: boolean;
  vrFrom: "VR" | "AR" | "3D" | null;
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
  type: FileType;
  content: string | ArrayBuffer;
  size: number;
  lastModified: number;
}

export interface CanvasContextType {
  initialData: CanvasData | null;
}

export interface CodeSelection {
  nodeId: string;
  from: number;
  to: number;
  text: string;
  themeIds: string[];
  colors: string[];
}

export interface Code {
  id: string;
  name: string;
  color: string;
  comment?: string;
  groupId?: string;
  order?: number;
}

export interface CodeGroup {
  id: string;
  name: string;
}
