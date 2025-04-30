"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FileIcon } from "lucide-react";
import { useCanvas } from "../useCanvas";
import { FileType } from "../types";
import { useState } from "react";

export function AddFileDialog() {
  const { controls } = useCanvas();
  const [open, setOpen] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let fileType: FileType;
      if (file.type.startsWith("image/")) {
        fileType = "image";
      } else {
        fileType = "text";
      }

      controls.addFileNode(file, fileType);
      setOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          size="icon"
          aria-label="Add file"
          tooltip="Add file node"
          tooltipSide="right"
        >
          <FileIcon size={20} />
        </Button>
      }
      title="Add File"
      description="Upload a file to add it to your canvas."
    >
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileIcon className="w-8 h-8 mb-4 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-muted-foreground">
              .txt, .md, .docx, .html, and image files supported
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".txt,.md,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*,html"
          />
        </label>
      </div>
    </Modal>
  );
}
