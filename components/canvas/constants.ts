import { Viewport } from "./types";

export const VIEWPORT_CONSTANTS = {
  ZOOM_SPEED: 0.05,
  MIN_SCALE: 0.35,
  MAX_SCALE: 1.25,
  ZOOM_BUTTON_FACTOR: 1.05,
} as const;

export const NODE_CONSTANTS = {
  NODE_HEIGHT: 200,
  TEXT_NODE_WIDTH: 400,
  FILE_NODE_WIDTH: 400,
  STICKY_NODE_WIDTH: 400,

  MAX_NODE_HEIGHT: 500,
  MAX_NODE_WIDTH: 600,
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
