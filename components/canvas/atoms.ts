import { atom } from "jotai";
import type { Node, Edge, Viewport } from "./types";
import { defaultViewport } from "./constants";

// Persistent atoms
export const nodesAtom = atom<Node[]>([]);
export const edgesAtom = atom<Edge[]>([]);
export const viewportAtom = atom<Viewport>(defaultViewport);
