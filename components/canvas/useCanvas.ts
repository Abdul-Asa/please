import { useAtom } from "jotai";
import { useContext, useRef, useCallback, useEffect, useState } from "react";
import { nodesAtom, edgesAtom, viewportAtom } from "./atoms";
import { VIEWPORT_CONSTANTS, defaultViewport } from "./constants";
import { CanvasContext } from "./Context";
const { MIN_SCALE, MAX_SCALE, ZOOM_SPEED, ZOOM_BUTTON_FACTOR } =
  VIEWPORT_CONSTANTS;

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
  const [isSpacePressed, setIsSpacePressed] = useState(false);

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

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY;
        const direction = delta > 0 ? -1 : 1;
        const factor = Math.pow(1.1, direction);

        setViewport((prev) => {
          // Calculate new scale
          const newScale = Math.min(
            Math.max(prev.scale * factor, MIN_SCALE),
            MAX_SCALE
          );

          if (newScale === prev.scale) return prev;

          // Calculate zoom center point
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return { ...prev, scale: newScale };

          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          // Calculate new offsets to zoom into mouse position
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
      }
    },
    [setViewport]
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
      // Allow panning when either space is pressed or panMode is active
      if ((!isSpacePressed && !viewport.panMode) || e.button !== 0) return;

      setViewport((prev) => ({
        ...prev,
        isPanning: true,
        panStartX: e.clientX - prev.panOffsetX,
        panStartY: e.clientY - prev.panOffsetY,
      }));
    },
    [isSpacePressed, viewport.panMode, setViewport]
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

  // Handle space key for panning
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);

        if (!viewport.panMode) {
          canvasRef.current?.classList.add("will-pan");
        }
      }
    },
    [viewport.panMode]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        setViewport((prev) => ({
          ...prev,
          isPanning: false,
        }));

        if (!viewport.panMode) {
          canvasRef.current?.classList.remove("will-pan");
        }
      }
    },
    [viewport.panMode, setViewport]
  );

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

  // Initialize the canvas
  useEffect(() => {
    if (initialData) {
      setNodes(initialData.nodes);
      setEdges(initialData.edges);
      resetView();
      setLoading(false);
    }
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

  // Set up event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleKeyDown,
    handleKeyUp,
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
      togglePanMode,
    },
    dragHandlers: {
      startNodeDrag,
      handleNodeDrag,
    },
  };
}
