import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { Editor } from "@tiptap/react";
import type { Node, Viewport, Code, CodeGroup } from "./types";
import { defaultViewport } from "./constants";
// import Dexie from "dexie";
// Persistent atoms
export const nodesAtom = atomWithStorage<Node[]>("nodes", []);
export const viewportAtom = atomWithStorage<Viewport>(
  "viewport",
  defaultViewport
);
export const codesAtom = atomWithStorage<Code[]>("codes", []);
export const codeGroupsAtom = atomWithStorage<CodeGroup[]>("codeGroups", []);
export const editorsAtom = atom<Map<string, Editor>>(new Map());

// IndexedDB store
// export class CanvasDatabase extends Dexie {
//   fileContents!: Dexie.Table<FileContent, string>;

//   constructor() {
//     super("canvas-store");
//     this.version(1).stores({
//       fileContents: "id, name, type, size, lastModified",
//     });
//   }
// }

// export const indexedDB = new CanvasDatabase();

// // Helper functions for file operations
// export async function storeFileContent(
//   fileContent: FileContent
// ): Promise<string> {
//   try {
//     await indexedDB.fileContents.put(fileContent);
//     return fileContent.id;
//   } catch (error) {
//     console.error("Error storing file content:", error);
//     throw error;
//   }
// }

// export async function getFileContent(
//   id: string
// ): Promise<FileContent | undefined> {
//   try {
//     return await indexedDB.fileContents.get(id);
//   } catch (error) {
//     console.error("Error retrieving file content:", error);
//     return undefined;
//   }
// }

// export async function deleteFileContent(id: string): Promise<void> {
//   try {
//     await indexedDB.fileContents.delete(id);
//   } catch (error) {
//     console.error("Error deleting file content:", error);
//   }
// }
