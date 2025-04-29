import {
  useMutation,
  useMyPresence,
  useStorage,
  useOthers,
} from "@liveblocks/react/suspense";
import { useCanvas } from "../useCanvas";
import {
  Code,
  CodeGroup,
  FileNode,
  FileType,
  LiveNode,
  TextNode,
} from "../types";
import { Button } from "@/components/ui/button";
import {
  BoxIcon,
  FileIcon,
  ImageIcon,
  MaximizeIcon,
  Trash2Icon,
  TypeIcon,
} from "lucide-react";
import { defaultViewport, NODE_CONSTANTS } from "../constants";
import { nanoid } from "nanoid";
import { readFileContent } from "../utils";
import { Modal } from "@/components/ui/modal";
import { useState, useEffect } from "react";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { FolderOpen, Link, Plus, Trash2, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { FileNodeContent } from "../node/FileNode";
import { JSONContent } from "@tiptap/react";
import { Editor } from "../text-editor";

export function MultiplayerNodes() {
  const multiplayerCanvas = useStorage((root) => root.nodes);
  const [presence, updatePresence] = useMyPresence();
  const others = useOthers();
  const {
    canvas: { viewport },
    controls: { updateViewport },
  } = useCanvas();

  const nodes = useStorage((root) => root.nodes);

  const updateNode = useMutation(
    ({ storage }, nodeId: string, updates: Partial<LiveNode>) => {
      const nodes = storage.get("nodes");
      const nodeIndex = nodes.findIndex((node) => node.id === nodeId);
      if (nodeIndex !== -1) {
        nodes.set(nodeIndex, {
          ...nodes.get(nodeIndex),
          ...updates,
        } as LiveNode);
      }
    },
    []
  );

  // Handle node dragging
  useEffect(() => {
    if (!viewport.isDragging || !viewport.selectedNodeId || !viewport.dragState)
      return;

    const handleGlobalNodeDrag = (e: MouseEvent) => {
      e.preventDefault();
      const deltaX = (e.clientX - viewport.dragState.startX) / viewport.scale;
      const deltaY = (e.clientY - viewport.dragState.startY) / viewport.scale;

      updateNode(viewport.selectedNodeId, {
        x: viewport.dragState.initialNodeX + deltaX,
        y: viewport.dragState.initialNodeY + deltaY,
      });
    };

    window.addEventListener("pointermove", handleGlobalNodeDrag);
    window.addEventListener(
      "pointerup",
      () => {
        updateViewport({
          isDragging: false,
          selectedNodeId: "",
          dragState: {
            startX: 0,
            startY: 0,
            initialNodeX: 0,
            initialNodeY: 0,
          },
        });
        // Clear the nodeBeingDragged from presence
        updatePresence({ nodeBeingDragged: "" });
      },
      { once: true }
    );

    return () => {
      window.removeEventListener("pointermove", handleGlobalNodeDrag);
    };
  }, [
    viewport.isDragging,
    viewport.selectedNodeId,
    viewport.dragState,
    viewport.scale,
    updateNode,
    updateViewport,
    updatePresence,
  ]);

  const startNodeDrag = (event: React.MouseEvent, nodeId: string) => {
    event.preventDefault();
    event.stopPropagation();

    if (viewport.isPanning) return;

    // Check if someone else is dragging this node
    const otherDragger = others.find(
      (other) => other.presence.nodeBeingDragged === nodeId
    );
    if (otherDragger) {
      // Someone else is dragging this node, so we can't drag it
      return;
    }

    const node = multiplayerCanvas.find((n) => n.id === nodeId);
    if (!node) return;

    // Set the nodeBeingDragged in presence
    updatePresence({ nodeBeingDragged: nodeId });

    updateViewport({
      isDragging: true,
      selectedNodeId: nodeId,
      lastSelectedNodeId: nodeId,
      dragState: {
        startX: event.clientX,
        startY: event.clientY,
        initialNodeX: node.x,
        initialNodeY: node.y,
      },
    });
  };

  // Find who is dragging a specific node
  const getNodeDragger = (nodeId: string) => {
    if (presence.nodeBeingDragged === nodeId) {
      return { color: presence.color, name: presence.name };
    }

    const otherDragger = others.find(
      (other) => other.presence.nodeBeingDragged === nodeId
    );
    if (otherDragger) {
      return {
        color: otherDragger.presence.color,
        name: otherDragger.presence.name,
      };
    }

    return null;
  };

  const deleteNode = useMutation(({ storage }, nodeId: string) => {
    const nodes = storage.get("nodes");
    const nodeIndex = nodes.findIndex((node) => node.id === nodeId);
    if (nodeIndex !== -1) {
      nodes.delete(nodeIndex);
    }
  }, []);

  const resetView = () => {
    // Find boundaries of all nodes
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x + node.width);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y + node.height);
    });

    // If no nodes, reset to default
    if (!nodes.length || minX === Infinity) {
      updateViewport(defaultViewport);
      return;
    }

    const boundingBoxWidth = maxX - minX;
    const boundingBoxHeight = maxY - minY;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate scale with fixed padding of 80px
    const scaleX = viewportWidth / (boundingBoxWidth + 80);
    const scaleY = viewportHeight / (boundingBoxHeight + 80);
    const newScale = Math.min(scaleX, scaleY, 1); // Never zoom in beyond 100%

    // Calculate centering offsets
    const newPanOffsetX =
      (viewportWidth - boundingBoxWidth * newScale) / 2 - minX * newScale;
    const newPanOffsetY =
      (viewportHeight - boundingBoxHeight * newScale) / 2 - minY * newScale;

    updateViewport({
      scale: newScale,
      panOffsetX: newPanOffsetX,
      panOffsetY: newPanOffsetY,
      isPanning: false,
      isDragging: false,
    });
  };

  return (
    <div
      style={{
        transform: `translate(${viewport.panOffsetX}px, ${viewport.panOffsetY}px) scale(${viewport.scale})`,
        transformOrigin: "left top",
      }}
    >
      {multiplayerCanvas.map((node) => {
        const dragger = getNodeDragger(node.id);
        return (
          <MultiplayerCanvasNode
            key={node.id}
            node={node}
            viewport={viewport}
            deleteNode={deleteNode}
            updateNode={updateNode}
            startNodeDrag={startNodeDrag}
            resetToDefaultView={resetView}
            updateViewport={updateViewport}
            dragger={dragger}
          />
        );
      })}
    </div>
  );
}

export function AddMultiplayerNode() {
  const {
    controls: { getRandomPositionInViewport, updateViewport },
  } = useCanvas();
  const position = getRandomPositionInViewport();

  const addTextNode = useMutation(({ storage }) => {
    const nodes = storage.get("nodes");
    const newNode: LiveNode = {
      id: nanoid(),
      label: "Text-" + nanoid(6),
      type: "text",
      text: "New text",
      x: position.x,
      y: position.y,
      width: NODE_CONSTANTS.TEXT_NODE_WIDTH,
      height: NODE_CONSTANTS.NODE_HEIGHT,
      vrText: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "New text" }] },
        ],
      },
    };

    nodes.push(newNode);
    updateViewport({
      selectedNodeId: newNode.id,
      lastSelectedNodeId: newNode.id,
    });
  }, []);
  return (
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
  );
}

export function AddMultiplayerFileNode() {
  const {
    controls: { getRandomPositionInViewport, updateViewport },
  } = useCanvas();
  const position = getRandomPositionInViewport();
  const [open, setOpen] = useState(false);

  const addFileNode = useMutation(
    async ({ storage }, file: File, fileType: FileType) => {
      const nodeId = nanoid();
      const fileName = file.name || "File-" + nanoid(6);

      let content = "";

      try {
        // Read the file content
        content = await readFileContent(file);

        // Store in IndexedDB
        // const fileContent: FileContent = {
        //   id: nodeId,
        //   name: fileName,
        //   type: fileType,
        //   content,
        //   size: file.size,
        //   lastModified: file.lastModified,
        // };

        // await storeFileContent(fileContent);
      } catch (error) {
        console.error("Error processing file:", error);
        // Continue with node creation even if file processing fails
      }
      // Create the base node
      const newNode: LiveNode = {
        id: nodeId,
        type: "file",
        file: fileName,
        label: fileName,
        x: position.x,
        y: position.y,
        width: NODE_CONSTANTS.FILE_NODE_WIDTH,
        height: NODE_CONSTANTS.NODE_HEIGHT,
        fileType: fileType,
        vrText: fileType === "image" ? { image: content } : {},
        content,
      };

      const nodes = storage.get("nodes");
      nodes.push(newNode);
      updateViewport({
        selectedNodeId: newNode.id,
        lastSelectedNodeId: newNode.id,
      });
      return newNode;
    },
    []
  );

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

      addFileNode(file, fileType);

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
              .txt, .md, .docx, and image files supported
            </p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".txt,.md,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
          />
        </label>
      </div>
    </Modal>
  );
}

export function MultiplayerNodeManager() {
  const { canvas, controls } = useCanvas();
  const { viewport } = canvas;
  const { getCodeSelections, updateViewport, getRandomPositionInViewport } =
    controls;
  const [open, setOpen] = useState(false);

  const nodes = useStorage((root) => root.nodes);
  const codes = useStorage((root) => root.codes);
  const position = getRandomPositionInViewport();
  const deleteNode = useMutation(({ storage }, nodeId: string) => {
    const nodes = storage.get("nodes");
    const nodeIndex = nodes.findIndex((node) => node.id === nodeId);
    if (nodeIndex !== -1) {
      nodes.delete(nodeIndex);
    }
  }, []);

  const handleDeleteAll = () => {
    nodes.forEach((node) => deleteNode(node.id));
    controls.resetToDefaultView();
    setOpen(false);
  };

  const getSelectionCount = (nodeId: string) => {
    let count = 0;
    codes.forEach((code) => {
      const selections = getCodeSelections(code.id);
      count += selections.filter((s) => s.nodeId === nodeId).length;
    });
    return count;
  };

  const addTextNode = useMutation(({ storage }) => {
    const nodes = storage.get("nodes");
    const newNode: LiveNode = {
      id: nanoid(),
      label: "Text-" + nanoid(6),
      type: "text",
      text: "New text",
      x: position.x,
      y: position.y,
      width: NODE_CONSTANTS.TEXT_NODE_WIDTH,
      height: NODE_CONSTANTS.NODE_HEIGHT,
      vrText: {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "New text" }] },
        ],
      },
    };

    nodes.push(newNode);
    updateViewport({
      selectedNodeId: newNode.id,
      lastSelectedNodeId: newNode.id,
    });
  }, []);

  const scrollToNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    // Calculate the center of the node
    const nodeCenterX = node.x + node.width / 2;
    const nodeCenterY = node.y + node.height / 2;

    // Calculate the viewport center
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate the new pan offset to center the node
    const newPanOffsetX = viewportWidth / 2 - nodeCenterX * viewport.scale;
    const newPanOffsetY = viewportHeight / 2 - nodeCenterY * viewport.scale;

    updateViewport({
      panOffsetX: newPanOffsetX,
      panOffsetY: newPanOffsetY,
      selectedNodeId: nodeId,
      lastSelectedNodeId: nodeId,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          tooltip="Node Manager"
          tooltipSide="bottom"
        >
          <FolderOpen size={18} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:w-[400px] w-[calc(100vw-2rem)]">
        <SheetHeader>
          <SheetTitle>Node Manager</SheetTitle>
          <SheetDescription>
            Manage your nodes and their associated theme marks.
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-2 mt-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => {
              addTextNode();
              setOpen(false);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Node
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all
                  nodes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll}>
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="space-y-2 mt-4 overflow-y-auto h-[calc(100vh-220px)]">
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <div
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md",
                  viewport.selectedNodeId === node.id && "bg-accent"
                )}
              >
                {node.type === "text" ? (
                  <TypeIcon size={16} className="text-muted-foreground" />
                ) : (
                  <FileIcon size={16} className="text-muted-foreground" />
                )}
                <div className="flex-1 flex items-center justify-between gap-1 min-w-0">
                  <span className="truncate block">{node.label}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-xs text-muted-foreground">
                          ({getSelectionCount(node.id)})
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {getSelectionCount(node.id) > 0
                          ? `${getSelectionCount(node.id)} selections`
                          : "No selections"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    tooltip="Scroll to Node"
                    onClick={() => {
                      scrollToNode(node.id);
                      setOpen(false);
                    }}
                  >
                    <Link size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => deleteNode(node.id)}
                    tooltip="Delete Node"
                  >
                    <X size={16} className="text-destructive" />
                  </Button>
                </div>
              </div>
              {index < nodes.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MultiplayerCanvasNode({
  node,
  viewport,
  deleteNode,
  updateNode,
  startNodeDrag,
  resetToDefaultView,
  updateViewport,
  dragger,
}: {
  node: any;
  viewport: any;
  deleteNode: any;
  updateNode: any;
  startNodeDrag: any;
  resetToDefaultView: any;
  updateViewport: any;
  dragger?: { color: string; name: string } | null;
}) {
  const isSelected = viewport.selectedNodeId === node.id;
  const isLastSelected = viewport.lastSelectedNodeId === node.id;
  const isPanMode = viewport.panMode;
  const isExpanded = viewport.expandedNodeId === node.id;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    deleteNode(node.id);
  };

  const handleLabelChange = (e: React.FocusEvent<HTMLSpanElement>) => {
    const newLabel = e.currentTarget.textContent?.trim();
    if (!newLabel) {
      // Reset to original label if empty
      e.currentTarget.textContent = node.label || node.type;
      return;
    }
    if (newLabel !== node.label) {
      updateNode(node.id, { label: newLabel });
    }
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    e.stopPropagation();

    if (e.key === "Enter") {
      e.preventDefault();
      const content = e.currentTarget.textContent?.trim();
      if (!content) {
        // Reset to original label if empty
        e.currentTarget.textContent = node.label || node.type;
      }
      e.currentTarget.blur();
    }
  };

  return (
    <motion.div
      draggable={false}
      className={cn(
        "absolute node group rounded-md border-2 border-border bg-background dark:bg-[#1e0516] flex flex-col",
        !isPanMode && "hover:shadow-sm",
        isSelected && !dragger && "border-ring"
      )}
      layout
      layoutId={`${node.id}-container`}
      style={{
        ...(dragger
          ? {
              borderColor: dragger.color,
              borderWidth: "2px",
            }
          : {}),
        minWidth: isExpanded ? "0px" : node.width,
        minHeight: node.height,
        zIndex: isExpanded ? 100 : isLastSelected ? 10 : "auto",
        maxWidth: isExpanded ? "none" : NODE_CONSTANTS.MAX_NODE_WIDTH,
        maxHeight: isExpanded ? "none" : NODE_CONSTANTS.MAX_NODE_HEIGHT,
        height: isExpanded
          ? "calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 2rem)"
          : "auto",
        width: isExpanded
          ? "calc(100dvw - env(safe-area-inset-left) - env(safe-area-inset-right) - 2rem)"
          : "max-content",
        left: isExpanded ? -viewport.panOffsetX / viewport.scale + 16 : node.x,
        top: isExpanded ? -viewport.panOffsetY / viewport.scale + 16 : node.y,
      }}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 35,
        mass: 1.2,
        duration:
          viewport.isDragging || viewport.isPanning || viewport.isScrolling
            ? 0
            : 0.4,
      }}
    >
      <div
        className={cn(
          "flex items-center justify-between p-0.5 border-b shrink-0 border-border",
          !isPanMode && "cursor-grab active:cursor-grabbing"
        )}
        onMouseDown={(e) => !isPanMode && startNodeDrag(e, node.id)}
      >
        <motion.div
          layout="position"
          layoutId={`${node.id}-label`}
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 35,
            mass: 1.2,
            duration:
              viewport.isDragging || viewport.isPanning || viewport.isScrolling
                ? 0
                : 0.4,
          }}
          className="flex items-center"
        >
          {node.type === "text" && <TypeIcon size={16} className="mx-2" />}
          {node.type === "file" && node.fileType === "image" && (
            <ImageIcon size={16} className="mx-2" />
          )}
          {node.type === "file" && node.fileType !== "image" && (
            <FileIcon size={16} className="mx-2" />
          )}

          <div className="h-6 w-px bg-border mx-0.5"></div>
          <div className="flex items-center ml-2 gap-2 max-w-[200px]">
            <span
              contentEditable={!isPanMode}
              suppressContentEditableWarning
              onBlur={handleLabelChange}
              onKeyDown={handleLabelKeyDown}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              className="text-sm line-clamp-1 w-full font-medium cursor-text outline-none focus:border-b border-ring px-1"
            >
              {node.label || node.type}
            </span>
          </div>
          <Button
            size={"icon"}
            variant={"ghost"}
            className={cn((!viewport.vrFrom || isPanMode) && "invisible")}
            onClick={() => {
              updateViewport({
                is3D: viewport.vrFrom,
                expandedNodeId: node.id,
                vrFrom: null,
              });
            }}
            tooltip="Return back to VR"
          >
            <BoxIcon className="animate-bounce" />
          </Button>
        </motion.div>
        <motion.div
          layoutId={`${node.id}-controls`}
          layout="position"
          className="flex items-center"
          transition={{
            type: "spring",
            stiffness: 250,
            damping: 35,
            mass: 1.2,
            duration:
              viewport.isDragging || viewport.isPanning || viewport.isScrolling
                ? 0
                : 0.4,
          }}
        >
          <Button
            variant={"ghost"}
            size={"icon"}
            className={cn(isPanMode && "invisible")}
            onClick={() => {
              resetToDefaultView();
              if (isExpanded) {
                updateViewport({ expandedNodeId: "" });
              } else {
                updateViewport({ expandedNodeId: node.id });
              }
            }}
            tooltip="Expand node"
          >
            <MaximizeIcon />
          </Button>
          <Button
            variant={"ghost"}
            size={"icon"}
            className={cn(
              "hover:text-destructive/80",
              isPanMode && "invisible"
            )}
            onClick={handleDelete}
            tooltip="Delete node"
          >
            <Trash2Icon />
          </Button>
        </motion.div>
      </div>
      <MultiPlayerNodeContent node={node} />
    </motion.div>
  );
}

function MultiPlayerNodeContent({ node }: { node: LiveNode }) {
  const codes = useStorage((root) => root.codes);
  const codeGroups = useStorage((root) => root.codeGroups);
  const updateNode = useMutation(
    ({ storage }, nodeId: string, updates: Partial<LiveNode>) => {
      const nodes = storage.get("nodes");
      const nodeIndex = nodes.findIndex((node) => node.id === nodeId);
      if (nodeIndex !== -1) {
        nodes.set(nodeIndex, {
          ...nodes.get(nodeIndex),
          ...updates,
        } as LiveNode);
      }
    },
    []
  );

  const handleContentChange = ({
    content,
    text,
  }: {
    content: string;
    text: JSONContent;
  }) => {
    updateNode(node.id, {
      text: content,
      vrText: text,
    });
  };

  return node.type === "text" ? (
    <Editor
      content={node.text}
      onChange={handleContentChange}
      nodeId={node.id}
      codes={codes as unknown as Code[]}
      codeGroups={codeGroups as unknown as CodeGroup[]}
    />
  ) : (
    <FileNodeContent node={node as FileNode} />
  );
}
