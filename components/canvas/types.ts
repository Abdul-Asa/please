export type NodeType = "text" | "file" | "sticky";
export type FileType = "image" | "pdf" | "text";

interface BaseNode {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
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

export interface CodeSelection {
  start: number;
  end: number;
  text: string;
  nodeId: string;
}

export interface Code {
  id: string;
  name: string;
  comment: string;
  color: string;
  selections: CodeSelection[];
}

export interface CodeGroup {
  id: string;
  name: string;
  codes: Code[];
}

export interface ThemeMark {
  nodeId: string;
  from: number;
  to: number;
  themeIds: string[];
  colors: string[];
}
