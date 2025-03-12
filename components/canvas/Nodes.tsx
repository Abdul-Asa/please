"use client";
import { useCanvas } from "./useCanvas";
import { FileNode, Node, StickyNode, TextNode } from "./types";
import { cn } from "@/lib/utils";
import {
  FileIcon,
  StickyNoteIcon,
  TypeIcon,
  Trash2Icon,
  FileTextIcon,
  ImageIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { getFileContent, FileContent } from "./store";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export function CanvasNodes() {
  const { canvas } = useCanvas();
  const { nodes, viewport } = canvas;

  return (
    <div
      style={{
        transform: `translate(${viewport.panOffsetX}px, ${viewport.panOffsetY}px) scale(${viewport.scale})`,
        transformOrigin: "left top",
      }}
    >
      {nodes.map((node) => (
        <CanvasNode key={node.id} node={node} />
      ))}
    </div>
  );
}

function CanvasNode({ node }: { node: Node }) {
  const {
    canvas: { viewport },
    dragHandlers: { startNodeDrag },
    controls: { deleteNode },
  } = useCanvas();

  const isSelected = viewport.selectedNodeId === node.id;
  const isLastSelected = viewport.lastSelectedNodeId === node.id;
  const isPanMode = viewport.panMode;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deleteNode(node.id);
  };

  return (
    <div
      draggable={false}
      className={cn(
        "absolute rounded-md border-2 border-primary-light bg-background",
        !isPanMode && "hover:shadow-sm",
        isSelected && "border-ring",
        isLastSelected && "z-10",
        "group"
      )}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
      }}
    >
      <div
        className={cn(
          "flex items-center justify-between p-0.5 border-b",
          !isPanMode && "cursor-grab active:cursor-grabbing"
        )}
        onMouseDown={(e) => !isPanMode && startNodeDrag(e, node.id)}
      >
        <div className="flex items-center">
          {node.type === "text" && <TypeIcon size={16} className="mx-2" />}
          {node.type === "file" && node.fileType === "image" && (
            <ImageIcon size={16} className="mx-2" />
          )}
          {node.type === "file" && node.fileType !== "image" && (
            <FileIcon size={16} className="mx-2" />
          )}
          {node.type === "sticky" && (
            <StickyNoteIcon size={16} className="mx-2" />
          )}
          <div className="h-6 w-px bg-border mx-0.5"></div>
          <div className="flex items-center ml-2 gap-2">
            <p className="text-sm font-medium">{node.label || node.type}</p>
          </div>
        </div>
        {!isPanMode && (
          <Button
            variant={"ghost"}
            size={"icon"}
            className="hover:text-destructive/80"
            onClick={handleDelete}
            title="Delete node"
          >
            <Trash2Icon />
          </Button>
        )}
      </div>
      <div className="p-2 h-[calc(100%-2.5rem)] overflow-auto">
        {node.type === "text" && <TextNodeContent node={node as TextNode} />}
        {node.type === "file" && <FileNodeContent node={node as FileNode} />}
        {node.type === "sticky" && (
          <StickyNodeContent node={node as StickyNode} />
        )}
      </div>
    </div>
  );
}

function TextNodeContent({ node }: { node: TextNode }) {
  return (
    <div className="h-full">
      <p>{node.text}</p>
    </div>
  );
}

function FileNodeContent({ node }: { node: FileNode }) {
  const [fileContent, setFileContent] = useState<FileContent | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfScale, setPdfScale] = useState(1.0);

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        setLoading(true);
        const content = await getFileContent(node.id);
        console.log("content", content);
        setFileContent(content);
        setError(null);
      } catch (err) {
        console.error("Error fetching file content:", err);
        setError("Failed to load file content");
      } finally {
        setLoading(false);
      }
    };

    fetchFileContent();
  }, [node.id]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!fileContent) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <FileTextIcon className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {node.label || "Empty file"}
        </p>
      </div>
    );
  }

  if (fileContent.type === "image") {
    return (
      <div className="flex items-center justify-center h-full">
        <img
          src={fileContent.content as string}
          alt={fileContent.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  if (fileContent.type === "text") {
    return (
      <div className="h-full overflow-auto whitespace-pre-wrap font-mono text-sm">
        {fileContent.content as string}
      </div>
    );
  }

  if (fileContent.type === "pdf") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <div className="w-full overflow-auto flex justify-center">
          <Document
            file={fileContent.content}
            onLoadSuccess={onDocumentLoadSuccess}
            className="max-w-full"
            loading={
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
            }
            error={
              <p className="text-sm text-destructive">Failed to load PDF</p>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={pdfScale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            title="Previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="text-xs">
            Page {currentPage} of {totalPages || "?"}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            title="Next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPdfScale((prev) => Math.max(0.5, prev - 0.2))}
            title="Zoom out"
          >
            -
          </Button>
          <span className="text-xs">{Math.round(pdfScale * 100)}%</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPdfScale((prev) => Math.min(2.5, prev + 0.2))}
            title="Zoom in"
          >
            +
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {fileContent.name} ({(fileContent.size / 1024).toFixed(1)} KB)
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <FileIcon className="w-8 h-8 text-muted-foreground" />
      <p className="text-sm">{fileContent.name}</p>
      <p className="text-xs text-muted-foreground">{fileContent.type}</p>
    </div>
  );
}

function StickyNodeContent({ node }: { node: StickyNode }) {
  return (
    <div className="h-full">
      <p>{node.text}</p>
    </div>
  );
}
