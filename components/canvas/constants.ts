import { Viewport } from "./types";

export const VIEWPORT_CONSTANTS = {
  ZOOM_SPEED: 0.05,
  MIN_SCALE: 0.35,
  MAX_SCALE: 1.25,
  ZOOM_BUTTON_FACTOR: 1.05,
} as const;

export const NODE_CONSTANTS = {
  // A4 aspect ratio is roughly 1:1.414 (width:height)
  TEXT_NODE_WIDTH: 300, // Standard width for text nodes (like A4)
  FILE_NODE_WIDTH: 300, // Standard width for file nodes (like A4)
  STICKY_NODE_WIDTH: 300, // Default width for sticky notes
  MIN_HEIGHT: 800, // Minimum height for all nodes
} as const;

export const defaultViewport: Viewport = {
  scale: 1,
  panOffsetX: 0,
  panOffsetY: 0,
  panStartX: 0,
  panStartY: 0,
  isDragging: false,
  isPanning: false,
  selectedNodeId: "",
  lastSelectedNodeId: "",
  panMode: false,
  dragState: {
    startX: 0,
    startY: 0,
    initialNodeX: 0,
    initialNodeY: 0,
  },
};
