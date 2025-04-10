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
  isScrolling: false,
  selectedNodeId: "",
  lastSelectedNodeId: "",
  expandedNodeId: "",
  panMode: false,
  dragState: {
    startX: 0,
    startY: 0,
    initialNodeX: 0,
    initialNodeY: 0,
  },
};

export const PREDEFINED_COLORS = [
  "#000000",
  "#4B5563",
  "#9CA3AF",
  "#65483B",
  "#B08968",
  "#F87171",
  "#7F1D1D",

  "#991B1B",
  "#DC2626",
  "#FB923C",
  "#FBBF24",
  "#FCD34D",
  "#FDE047",

  "#827717",
  "#BEF264",
  "#86EFAC",
  "#4ADE80",
  "#16A34A",
  "#15803D",

  "#164E63",
  "#155E75",
  "#0D9488",
  "#67E8F9",
  "#7DD3FC",
  "#A5F3FC",
  "#3B82F6",

  "#1E3A8A",
  "#3730A3",
  "#6D28D9",
  "#A855F7",
  "#E9D5FF",
  "#7E22CE",
  "#A21CAF",
  "#9D174D",
  "#A78BAA",
];
