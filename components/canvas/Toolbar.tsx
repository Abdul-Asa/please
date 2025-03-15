"use client";

import { Button } from "@/components/ui/button";
import {
  TypeIcon,
  StickyNoteIcon,
  UploadIcon,
  FileTextIcon,
  FileImageIcon,
  FileIcon,
} from "lucide-react";
import { useCanvas } from "./useCanvas";
import { useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CanvasToolbar() {
  const canvas = useCanvas();
  const { addTextNode, addFileNode, addStickyNode } = canvas.controls;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [acceptTypes, setAcceptTypes] = useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Function to handle different file type selections
  const handleFileTypeSelect = (type: string) => {
    switch (type) {
      case "text":
        setAcceptTypes(".txt,.docx,.md");
        break;
      case "pdf":
        setAcceptTypes(".pdf");
        break;
      case "image":
        setAcceptTypes("image/*");
        break;
      default:
        setAcceptTypes("");
    }

    // Close the popover
    setIsPopoverOpen(false);

    // Trigger file input after a short delay to ensure accept attribute is updated
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const getFileType = (file: File) => {
    switch (file.type) {
      case "image/jpeg":
      case "image/png":
      case "image/gif":
      case "image/svg+xml":
      case "image/webp":
        return "image";
      case "application/pdf":
        return "pdf";
      case "text/plain":
        return "text";
      default:
        return "text";
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = getFileType(file);
      await addFileNode(file, fileType);
    }

    // Reset the file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-2 bg-background/90 backdrop-blur-sm rounded-md border border-border max-w-[95%] overflow-x-auto">
      <Button
        variant="ghost"
        className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-normal whitespace-nowrap"
        onClick={addTextNode}
      >
        <TypeIcon size={18} />
        <span className="md:inline hidden">Text</span>
      </Button>

      <div className="h-6 w-px bg-border mx-0.5"></div>

      {/* File upload popover */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-normal whitespace-nowrap"
          >
            <UploadIcon size={18} />
            <span className="md:inline hidden">Upload</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-2 h-9"
              onClick={() => handleFileTypeSelect("text")}
            >
              <FileTextIcon size={16} />
              <span>Text Document</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-2 h-9"
              onClick={() => handleFileTypeSelect("pdf")}
            >
              <FileIcon size={16} />
              <span>PDF</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-2 h-9"
              onClick={() => handleFileTypeSelect("image")}
            >
              <FileImageIcon size={16} />
              <span>Image</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept={acceptTypes}
        multiple
      />

      <div className="h-6 w-px bg-border mx-0.5"></div>

      <Button
        variant="ghost"
        className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-normal whitespace-nowrap"
        onClick={addStickyNode}
      >
        <StickyNoteIcon size={18} />
        <span className="md:inline hidden">Note</span>
      </Button>
    </div>
  );
}
