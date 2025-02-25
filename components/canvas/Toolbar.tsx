"use client";

import { Button } from "@/components/ui/button";
import { FileIcon, StickyNoteIcon, TypeIcon } from "lucide-react";
import { useCanvas } from "./useCanvas";

export function CanvasToolbar() {
  //   const { addNode } = useCanvas();

  const handleFileSelect = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*,application/pdf";

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        // Create a URL for the file
        const url = URL.createObjectURL(file);

        // Add the node with the file URL
        // addNode("file");
        // TODO: Update the node with the file URL
      };

      input.click();
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-background/80 backdrop-blur-sm rounded-lg border shadow-lg">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        // onClick={() => addNode("text")}
      >
        <TypeIcon className="w-4 h-4" />
        <span>Add Text</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        onClick={handleFileSelect}
      >
        <FileIcon className="w-4 h-4" />
        <span>Add File</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        // onClick={() => addNode("sticky")}
      >
        <StickyNoteIcon className="w-4 h-4" />
        <span>Add Note</span>
      </Button>
    </div>
  );
}
