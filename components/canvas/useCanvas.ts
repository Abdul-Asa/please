import { useAtom } from "jotai";
import { useContext, useRef, useCallback, useEffect, useState } from "react";
import {
  nodesAtom,
  edgesAtom,
  viewportAtom,
  storeFileContent,
  deleteFileContent,
  FileContent,
} from "./store";
import {
  VIEWPORT_CONSTANTS,
  NODE_CONSTANTS,
  defaultViewport,
} from "./constants";
import type { Node, FileNode, FileType } from "./types";
import { CanvasContext } from "./Context";
import { nanoid } from "nanoid";
import { readFileContent } from "./utils";
const { MIN_SCALE, MAX_SCALE, ZOOM_BUTTON_FACTOR } = VIEWPORT_CONSTANTS;

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a Canvas component");
  }
  const { initialData } = context;

  const canvasRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [edges, setEdges] = useAtom(edgesAtom);
  const [viewport, setViewport] = useAtom(viewportAtom);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * ZOOM_BUTTON_FACTOR, MAX_SCALE),
    }));
  }, [setViewport]);

  const zoomOut = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / ZOOM_BUTTON_FACTOR, MIN_SCALE),
    }));
  }, [setViewport]);

  const resetView = useCallback(() => {
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
      setViewport(defaultViewport);
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

    setViewport((prev) => ({
      ...prev,
      scale: newScale,
      panOffsetX: newPanOffsetX,
      panOffsetY: newPanOffsetY,
      isPanning: false,
      isDragging: false,
    }));
  }, [nodes, setViewport]);

  const resetToDefaultView = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      scale: 1,
    }));
  }, [setViewport]);

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      if (viewport.isPanning) return;

      // Handle pinch-zoom (trackpad or Ctrl+wheel)
      if (e.ctrlKey || e.metaKey) {
        // Use deltaY for pinch gestures (more natural on trackpads)
        const delta = -e.deltaY;

        setViewport((prev) => {
          // Use a smaller zoom factor for smoother trackpad pinch
          const zoomFactor = Math.exp(delta * 0.01);
          const newScale = Math.min(
            Math.max(prev.scale * zoomFactor, MIN_SCALE),
            MAX_SCALE
          );

          if (newScale === prev.scale) return prev;

          // Calculate zoom center point
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return { ...prev, scale: newScale };

          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          const zoomPoint = {
            x: (mouseX - prev.panOffsetX) / prev.scale,
            y: (mouseY - prev.panOffsetY) / prev.scale,
          };

          const newOffsetX = mouseX - zoomPoint.x * newScale;
          const newOffsetY = mouseY - zoomPoint.y * newScale;

          return {
            ...prev,
            scale: newScale,
            panOffsetX: newOffsetX,
            panOffsetY: newOffsetY,
          };
        });
        return;
      }

      // Handle regular scrolling (two-finger pan on trackpad)
      const deltaX = e.deltaX;
      const deltaY = e.deltaY;

      setViewport((prev) => ({
        ...prev,
        panOffsetX: prev.panOffsetX - deltaX,
        panOffsetY: prev.panOffsetY - deltaY,
      }));
    },
    [viewport.isPanning, setViewport]
  );

  // Handle panning
  const togglePanMode = useCallback(() => {
    const canvas = canvasRef.current;
    console.log(canvas);
    setViewport((prev) => ({
      ...prev,
      panMode: !prev.panMode,
    }));
  }, [setViewport]);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button !== 0 || !viewport.panMode) return; // Only handle left click and when pan mode is active

      setViewport((prev) => ({
        ...prev,
        isPanning: true,
        panStartX: e.clientX - prev.panOffsetX,
        panStartY: e.clientY - prev.panOffsetY,
      }));
    },
    [viewport.panMode, setViewport]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!viewport.isPanning) return;
      setViewport((prev) => ({
        ...prev,
        panOffsetX: e.clientX - prev.panStartX,
        panOffsetY: e.clientY - prev.panStartY,
      }));
    },
    [viewport.isPanning, setViewport]
  );

  const handleMouseUp = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      isPanning: false,
      isDragging: false,
      selectedNodeId: "",
      dragState: {
        startX: 0,
        startY: 0,
        initialNodeX: 0,
        initialNodeY: 0,
      },
    }));
  }, [setViewport]);

  // Add touch event handlers for mobile support
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 1) return; // Only handle single touch

      const touch = e.touches[0];
      setViewport((prev) => ({
        ...prev,
        isPanning: true,
        panStartX: touch.clientX - prev.panOffsetX,
        panStartY: touch.clientY - prev.panOffsetY,
      }));
    },
    [setViewport]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      if (!viewport.isPanning || e.touches.length !== 1) return;

      const touch = e.touches[0];
      setViewport((prev) => ({
        ...prev,
        panOffsetX: touch.clientX - prev.panStartX,
        panOffsetY: touch.clientY - prev.panStartY,
      }));
    },
    [viewport.isPanning, setViewport]
  );

  const handleTouchEnd = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      isPanning: false,
    }));
  }, [setViewport]);

  // Handle node drag
  const startNodeDrag = useCallback(
    (event: React.MouseEvent, nodeId: string) => {
      event.preventDefault();
      event.stopPropagation();

      if (viewport.isPanning) return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setViewport((prev) => ({
        ...prev,
        isDragging: true,
        selectedNodeId: nodeId,
        lastSelectedNodeId: nodeId,
        dragState: {
          startX: event.clientX,
          startY: event.clientY,
          initialNodeX: node.x,
          initialNodeY: node.y,
        },
      }));
    },
    [viewport.isPanning, nodes, setViewport]
  );

  const handleNodeDrag = useCallback(
    (event: MouseEvent) => {
      if (
        !viewport.isDragging ||
        !viewport.dragState ||
        !viewport.selectedNodeId
      )
        return;

      const deltaX =
        (event.clientX - viewport.dragState.startX) / viewport.scale;
      const deltaY =
        (event.clientY - viewport.dragState.startY) / viewport.scale;

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id !== viewport.selectedNodeId) return node;

          return {
            ...node,
            x: viewport.dragState.initialNodeX + deltaX,
            y: viewport.dragState.initialNodeY + deltaY,
          };
        })
      );
    },
    [viewport, setNodes]
  );

  // Get random position within visible canvas
  const getRandomPositionInViewport = useCallback(() => {
    // Calculate visible canvas area
    const visibleWidth = window.innerWidth / viewport.scale;
    const visibleHeight = window.innerHeight / viewport.scale;

    // Calculate the visible area boundaries in canvas coordinates
    const visibleLeft = -viewport.panOffsetX / viewport.scale;
    const visibleTop = -viewport.panOffsetY / viewport.scale;

    // Add padding from edges (10% of visible area)
    const paddingX = (visibleWidth * 0.1) / 2;
    const paddingY = (visibleHeight * 0.1) / 2;

    // Generate random position within visible area with padding
    return {
      x: visibleLeft + paddingX + Math.random() * (visibleWidth - paddingX * 2),
      y: visibleTop + paddingY + Math.random() * (visibleHeight - paddingY * 2),
    };
  }, [viewport]);

  const updateNode = useCallback((nodeId: string, update: Partial<Node>) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? ({ ...node, ...update } as Node) : node
      )
    );
  }, []);

  // Node creation
  const addTextNode = useCallback(() => {
    const position = getRandomPositionInViewport();

    const newNode: Node = {
      id: nanoid(),
      label: "Untitled-" + nanoid(6),
      type: "text",
      text: "New text",
      x: position.x,
      y: position.y,
      width: NODE_CONSTANTS.TEXT_NODE_WIDTH,
      height: NODE_CONSTANTS.NODE_HEIGHT,
    };

    setNodes((prev) => [...prev, newNode]);
    return newNode;
  }, [getRandomPositionInViewport, setNodes]);

  const addFileNode = useCallback(
    async (file: File, fileType: FileType) => {
      const position = getRandomPositionInViewport();
      const nodeId = nanoid();
      const fileName = file.name || "Untitled file-" + nanoid(6);

      // Create the base node
      const newNode: FileNode = {
        id: nodeId,
        type: "file",
        file: fileName,
        label: fileName,
        x: position.x,
        y: position.y,
        width: NODE_CONSTANTS.FILE_NODE_WIDTH,
        height: NODE_CONSTANTS.NODE_HEIGHT,
        fileType: fileType,
      };

      try {
        // Read the file content
        const content = await readFileContent(file);

        // Store in IndexedDB
        const fileContent: FileContent = {
          id: nodeId,
          name: fileName,
          type: fileType,
          content,
          size: file.size,
          lastModified: file.lastModified,
        };

        await storeFileContent(fileContent);
      } catch (error) {
        console.error("Error processing file:", error);
        // Continue with node creation even if file processing fails
      }

      setNodes((prev) => [...prev, newNode]);
      return newNode;
    },
    [getRandomPositionInViewport, setNodes]
  );

  const addStickyNode = useCallback(() => {
    const position = getRandomPositionInViewport();

    const newNode: Node = {
      id: nanoid(),
      type: "sticky",
      label: "New note-" + nanoid(6),
      text: "New note",
      x: position.x,
      y: position.y,
      width: NODE_CONSTANTS.STICKY_NODE_WIDTH,
      height: NODE_CONSTANTS.NODE_HEIGHT,
    };

    setNodes((prev) => [...prev, newNode]);
    return newNode;
  }, [getRandomPositionInViewport, setNodes]);

  const deleteNode = useCallback(
    (nodeId: string) => {
      // Get the node before deleting it
      const nodeToDelete = nodes.find((node) => node.id === nodeId);

      // Delete the node from the nodes array
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));

      // If it's a file node, also delete the file content from IndexedDB
      if (nodeToDelete?.type === "file") {
        deleteFileContent(nodeId).catch((err) =>
          console.error("Failed to delete file content:", err)
        );
      }

      // Clear selection if the deleted node was selected
      if (
        viewport.selectedNodeId === nodeId ||
        viewport.lastSelectedNodeId === nodeId
      ) {
        setViewport((prev) => ({
          ...prev,
          selectedNodeId:
            prev.selectedNodeId === nodeId ? "" : prev.selectedNodeId,
          lastSelectedNodeId:
            prev.lastSelectedNodeId === nodeId ? "" : prev.lastSelectedNodeId,
        }));
      }
    },
    [nodes, setNodes, viewport, setViewport]
  );
  // Initialize the canvas
  useEffect(() => {
    if (initialData) {
      setNodes(initialData.nodes);
      setEdges(initialData.edges);
      resetView();
    }
    setLoading(false);
  }, [initialData]);

  // Manage cursor class based on panMode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (viewport.panMode) {
      canvas.classList.add("will-pan");
    } else {
      canvas.classList.remove("will-pan");
    }
  }, [viewport.panMode]);

  // Update the event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("pointerdown", handleMouseDown);
    window.addEventListener("pointermove", handleMouseMove);
    window.addEventListener("pointerup", handleMouseUp);
    if ("ontouchstart" in window) {
      canvas.addEventListener("touchstart", handleTouchStart);
      canvas.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("pointerdown", handleMouseDown);
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);
      if ("ontouchstart" in window) {
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // Separate effect for drag handling
  useEffect(() => {
    if (!viewport.isDragging || !viewport.selectedNodeId) return;

    const handleGlobalNodeDrag = (e: MouseEvent) => {
      e.preventDefault();
      handleNodeDrag(e);
    };

    window.addEventListener("mousemove", handleGlobalNodeDrag);

    return () => {
      window.removeEventListener("mousemove", handleGlobalNodeDrag);
    };
  }, [viewport.isDragging, viewport.selectedNodeId, handleNodeDrag]);

  return {
    canvas: { nodes, edges, viewport },
    loading,
    canvasRef,
    controls: {
      zoomIn,
      zoomOut,
      resetView,
      resetToDefaultView,
      togglePanMode,
      addTextNode,
      addFileNode,
      addStickyNode,
      deleteNode,
      updateNode,
    },
    dragHandlers: {
      startNodeDrag,
      handleNodeDrag,
    },
  };
}
