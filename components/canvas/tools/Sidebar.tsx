"use client";

import { Button } from "@/components/ui/button";
import {
  TypeIcon,
  StickyNoteIcon,
  FileImageIcon,
  AnvilIcon,
  Hourglass,
} from "lucide-react";
import { useCanvas } from "../useCanvas";
import { useRef } from "react";
import { FileType } from "../types";
export function CanvasSidebar() {
  const canvas = useCanvas();
  const { addTextNode, addFileNode, addStickyNode } = canvas.controls;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    fileType: FileType
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await addFileNode(file, fileType);
    }

    // Reset the file input value to allow selecting the same file again
    if (event.target) {
      event.target.value = "";
    }
  };

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 p-2 backdrop-blur-sm rounded-sm border border-border shadow-sm">
      {/* Text note */}
      <Button
        variant="outline"
        size="icon"
        onClick={addTextNode}
        aria-label="Add text"
        tooltip="Add text node"
        tooltipSide="right"
      >
        <TypeIcon size={20} />
      </Button>

      {/* Sticky note */}
      <Button
        variant="outline"
        size="icon"
        onClick={addStickyNode}
        aria-label="Add sticky note"
        tooltip="Add sticky note"
        tooltipSide="right"
      >
        <StickyNoteIcon size={20} />
      </Button>

      {/* Upload Image */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => imageInputRef.current?.click()}
        aria-label="Upload image"
        tooltip="Upload image"
        tooltipSide="right"
      >
        <FileImageIcon size={20} />
      </Button>

      {/* More options */}
      <Button variant="outline" size="icon" aria-label="More options">
        <Hourglass size={20} />
      </Button>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={imageInputRef}
        className="hidden"
        onChange={(e) => handleFileUpload(e, "image")}
        accept="image/*"
        multiple
      />
      <input
        type="file"
        ref={textInputRef}
        className="hidden"
        onChange={(e) => handleFileUpload(e, "text")}
        accept=".txt,.docx,.md"
        multiple
      />
      <input
        type="file"
        ref={pdfInputRef}
        className="hidden"
        onChange={(e) => handleFileUpload(e, "pdf")}
        accept=".pdf"
        multiple
      />
    </div>
  );
}
