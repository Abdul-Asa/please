import { useAtom, useAtomValue } from "jotai";
import { useRef, useEffect } from "react";
import { loadable } from "jotai/utils";
import {
  nodesAtom,
  viewportAtom,
  storeFileContent,
  deleteFileContent,
  codesAtom,
  codeGroupsAtom,
  editorsAtom,
} from "./store";
import {
  VIEWPORT_CONSTANTS,
  NODE_CONSTANTS,
  defaultViewport,
} from "./constants";
import type {
  Node,
  FileNode,
  FileType,
  Viewport,
  FileContent,
  Code,
  CodeGroup,
  CodeSelection,
} from "./types";
import { nanoid } from "nanoid";
import { readFileContent } from "./utils";
import { Editor } from "@tiptap/react";
import { Node as ProseMirrorNode, Mark } from "prosemirror-model";
const { MIN_SCALE, MAX_SCALE, ZOOM_BUTTON_FACTOR } = VIEWPORT_CONSTANTS;

export function useCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Create loadable atoms to handle loading states
  const nodesLoadable = useAtomValue(loadable(nodesAtom));
  const viewportLoadable = useAtomValue(loadable(viewportAtom));
  const codesLoadable = useAtomValue(loadable(codesAtom));
  const codeGroupsLoadable = useAtomValue(loadable(codeGroupsAtom));

  // Determine if any atom is still loading
  const isLoading =
    nodesLoadable.state === "loading" ||
    viewportLoadable.state === "loading" ||
    codesLoadable.state === "loading" ||
    codeGroupsLoadable.state === "loading";

  // Use the loadable values once loaded
  const [nodes, setNodes] = useAtom(nodesAtom);
  const [viewport, setViewport] = useAtom(viewportAtom);
  const [codes, setCodes] = useAtom(codesAtom);
  const [codeGroups, setCodeGroups] = useAtom(codeGroupsAtom);
  const [editors, setEditors] = useAtom(editorsAtom);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Zoom functions
  const zoomIn = () => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * ZOOM_BUTTON_FACTOR, MAX_SCALE),
      isScrolling: true,
    }));

    // Set a timeout to set isScrolling back to false
    setTimeout(() => {
      setViewport((prev) => ({
        ...prev,
        isScrolling: false,
      }));
    }, 150); // 150ms delay
  };

  const zoomOut = () => {
    setViewport((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / ZOOM_BUTTON_FACTOR, MIN_SCALE),
      isScrolling: true,
    }));

    // Set a timeout to set isScrolling back to false
    setTimeout(() => {
      setViewport((prev) => ({
        ...prev,
        isScrolling: false,
      }));
    }, 150); // 150ms delay
  };

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
  };

  const resetToDefaultView = () => {
    setViewport(defaultViewport);
  };

  // Handle wheel zoom
  const handleWheel = (e: WheelEvent) => {
    if (e.target instanceof HTMLElement && e.target.id !== "canvas") {
      return;
    }
    e.preventDefault();
    if (viewport.panMode || viewport.expandedNodeId !== "") return;

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to true
    setViewport((prev) => ({
      ...prev,
      isScrolling: true,
    }));

    // Set a timeout to set isScrolling back to false
    scrollTimeoutRef.current = setTimeout(() => {
      setViewport((prev) => ({
        ...prev,
        isScrolling: false,
      }));
    }, 150); // 150ms delay

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
  };

  // Handle panning
  const togglePanMode = () => {
    const canvas = canvasRef.current;
    console.log(canvas);
    setViewport((prev) => ({
      ...prev,
      panMode: !prev.panMode,
      expandedNodeId: "",
    }));
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0 || !viewport.panMode) return; // Only handle left click and when pan mode is active

    setViewport((prev) => ({
      ...prev,
      isPanning: true,
      panStartX: e.clientX - prev.panOffsetX,
      panStartY: e.clientY - prev.panOffsetY,
    }));
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!viewport.isPanning) return;
    setViewport((prev) => ({
      ...prev,
      panOffsetX: e.clientX - prev.panStartX,
      panOffsetY: e.clientY - prev.panStartY,
    }));
  };

  const handleMouseUp = () => {
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
  };

  // Add touch event handlers for mobile support
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return; // Only handle single touch

    const touch = e.touches[0];
    if (viewport.panMode) {
      setViewport((prev) => ({
        ...prev,
        isPanning: true,
        panStartX: touch.clientX - prev.panOffsetX,
        panStartY: touch.clientY - prev.panOffsetY,
      }));
    } else {
      // Find the node under the touch point
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!target) return;

      const nodeElement = target.closest("[data-node-id]");
      if (!nodeElement) return;

      const nodeId = nodeElement.getAttribute("data-node-id");
      if (!nodeId) return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      setViewport((prev) => ({
        ...prev,
        isDragging: true,
        selectedNodeId: nodeId,
        lastSelectedNodeId: nodeId,
        dragState: {
          startX: touch.clientX,
          startY: touch.clientY,
          initialNodeX: node.x,
          initialNodeY: node.y,
        },
      }));
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    if (viewport.panMode) {
      setViewport((prev) => ({
        ...prev,
        panOffsetX: touch.clientX - prev.panStartX,
        panOffsetY: touch.clientY - prev.panStartY,
      }));
    } else if (
      viewport.isDragging &&
      viewport.dragState &&
      viewport.selectedNodeId
    ) {
      const deltaX =
        (touch.clientX - viewport.dragState.startX) / viewport.scale;
      const deltaY =
        (touch.clientY - viewport.dragState.startY) / viewport.scale;

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
    }
  };

  const handleTouchEnd = () => {
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
  };

  // Handle node drag
  const startNodeDrag = (event: React.MouseEvent, nodeId: string) => {
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
  };

  const handleNodeDrag = (event: MouseEvent) => {
    if (!viewport.isDragging || !viewport.dragState || !viewport.selectedNodeId)
      return;

    const deltaX = (event.clientX - viewport.dragState.startX) / viewport.scale;
    const deltaY = (event.clientY - viewport.dragState.startY) / viewport.scale;

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
  };

  // Get random position within visible canvas
  const getRandomPositionInViewport = () => {
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
  };

  const updateNode = (nodeId: string, update: Partial<Node>) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId ? ({ ...node, ...update } as Node) : node
      )
    );
  };

  const updateViewport = (update: Partial<Viewport>) => {
    setViewport((prev) => ({ ...prev, ...update }));
  };

  // Node creation
  const addTextNode = () => {
    const position = getRandomPositionInViewport();

    const newNode: Node = {
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

    setNodes((prev) => [...prev, newNode]);
    setViewport((prev) => ({
      ...prev,
      selectedNodeId: newNode.id,
      lastSelectedNodeId: newNode.id,
    }));
    return newNode;
  };

  const addFileNode = async (file: File, fileType: FileType) => {
    const position = getRandomPositionInViewport();
    const nodeId = nanoid();
    const fileName = file.name || "File-" + nanoid(6);

    let content = "";

    try {
      // Read the file content
      content = await readFileContent(file);

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
      vrText: {},
    };

    setNodes((prev) => [...prev, newNode]);
    setViewport((prev) => ({
      ...prev,
      selectedNodeId: newNode.id,
      lastSelectedNodeId: newNode.id,
    }));
    return newNode;
  };

  const deleteNode = (nodeId: string) => {
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
        expandedNodeId: "",
      }));
    }
  };

  // Code management functions
  const addCode = (code: Omit<Code, "id">) => {
    const newCode: Code = {
      ...code,
      id: nanoid(),
    };
    setCodes((prev) => [...prev, newCode]);
    return newCode;
  };

  const addCodeGroup = (group: Omit<CodeGroup, "id">) => {
    const newGroup: CodeGroup = {
      ...group,
      id: nanoid(),
    };
    setCodeGroups((prev) => [...prev, newGroup]);
    return newGroup;
  };

  const updateCode = (codeId: string, update: Partial<Code>) => {
    setCodes((prev) =>
      prev.map((code) => (code.id === codeId ? { ...code, ...update } : code))
    );
  };

  const updateCodeGroup = (groupId: string, update: Partial<CodeGroup>) => {
    setCodeGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, ...update } : group
      )
    );
  };

  const deleteCode = (codeId: string) => {
    // Remove the code from the codes array
    setCodes((prev) => prev.filter((code) => code.id !== codeId));

    // Remove theme marks from all editors
    editors.forEach((editor) => {
      if (editor) {
        // Get all theme marks in the document
        editor.state.doc.descendants((node, pos) => {
          if (node.marks) {
            node.marks.forEach((mark) => {
              if (mark.type.name === "themeMark" && mark.attrs.themeId) {
                const themeIds = Array.isArray(mark.attrs.themeId)
                  ? mark.attrs.themeId
                  : [mark.attrs.themeId];

                // If the deleted code's ID is in the theme marks
                if (themeIds.includes(codeId)) {
                  // Remove the code ID from the theme marks
                  const newThemeIds = themeIds.filter((id) => id !== codeId);
                  const newColors = Array.isArray(mark.attrs.color)
                    ? mark.attrs.color.filter(
                        (_, index) => themeIds[index] !== codeId
                      )
                    : mark.attrs.color;

                  // If there are no theme IDs left, remove the mark
                  if (newThemeIds.length === 0) {
                    editor
                      .chain()
                      .focus()
                      .setTextSelection({ from: pos, to: pos + node.nodeSize })
                      .unsetThemeMark()
                      .run();
                  } else {
                    // Otherwise update the mark with the remaining theme IDs
                    editor
                      .chain()
                      .focus()
                      .setTextSelection({ from: pos, to: pos + node.nodeSize })
                      .setThemeMark({ themeId: newThemeIds, color: newColors })
                      .run();
                  }
                }
              }
            });
          }
        });
      }
    });
  };

  const deleteCodeGroup = (groupId: string) => {
    setCodeGroups((prev) => prev.filter((group) => group.id !== groupId));
  };

  const getCodeSelections = (codeId: string): CodeSelection[] => {
    const selections: CodeSelection[] = [];

    editors.forEach((editor: Editor | undefined, nodeId: string) => {
      if (!editor) return;

      editor.state.doc.descendants((node: ProseMirrorNode, pos: number) => {
        if (node.marks) {
          node.marks.forEach((mark: Mark) => {
            if (mark.type.name === "themeMark" && mark.attrs.themeId) {
              const themeIds = Array.isArray(mark.attrs.themeId)
                ? mark.attrs.themeId
                : [mark.attrs.themeId];

              const colors = Array.isArray(mark.attrs.color)
                ? mark.attrs.color
                : [mark.attrs.color];

              if (themeIds.includes(codeId)) {
                selections.push({
                  nodeId,
                  text: node.textContent,
                  from: pos,
                  to: pos + node.nodeSize,
                  themeIds,
                  colors,
                });
              }
            }
          });
        }
      });
    });

    return selections;
  };

  const getCodesByGroup = () => {
    const groupedCodes = new Map<string, Code[]>();
    const ungroupedCodes: Code[] = [];

    // Initialize groups
    codeGroups.forEach((group) => {
      groupedCodes.set(group.id, []);
    });

    // Sort codes into groups
    codes.forEach((code) => {
      if (code.groupId) {
        const groupCodes = groupedCodes.get(code.groupId);
        if (groupCodes) {
          groupCodes.push(code);
        }
      } else {
        ungroupedCodes.push(code);
      }
    });

    // Sort codes by order within each group
    groupedCodes.forEach((groupCodes) => {
      groupCodes.sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    ungroupedCodes.sort((a, b) => (a.order || 0) - (b.order || 0));

    return { groupedCodes, ungroupedCodes };
  };

  //Editor management
  const getEditor = (nodeId: string) => {
    return editors.get(nodeId);
  };

  const setEditor = (nodeId: string, editor: Editor | undefined) => {
    setEditors((prev) => {
      const newMap = new Map(prev);
      if (editor) {
        newMap.set(nodeId, editor);
      } else {
        newMap.delete(nodeId);
      }
      return newMap;
    });
  };

  const getEditors = () => {
    return editors;
  };

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

  const scrollToCodeSelection = (codeSelection: CodeSelection) => {
    const { nodeId, from, to } = codeSelection;
    scrollToNode(nodeId);
    setViewport((prev) => ({
      ...prev,
      expandedNodeId: nodeId,
    }));
    const editor = getEditor(nodeId);
    if (!editor) return;

    editor.chain().focus().setTextSelection({ from, to }).run();
  };

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

  // Event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("pointerdown", handleMouseDown);
    window.addEventListener("pointermove", handleMouseMove);
    window.addEventListener("pointerup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("pointerdown", handleMouseDown);
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
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

    window.addEventListener("pointermove", handleGlobalNodeDrag);

    return () => {
      window.removeEventListener("pointermove", handleGlobalNodeDrag);
    };
  }, [viewport.isDragging, viewport.selectedNodeId, handleNodeDrag]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    canvas: { nodes, viewport, codes, codeGroups },
    loading: isLoading,
    canvasRef,
    controls: {
      zoomIn,
      zoomOut,
      resetView,
      resetToDefaultView,
      togglePanMode,
      addTextNode,
      addFileNode,
      deleteNode,
      updateNode,
      scrollToNode,
      scrollToCodeSelection,
      updateViewport,
      addCode,
      updateCode,
      deleteCode,
      addCodeGroup,
      updateCodeGroup,
      deleteCodeGroup,
      getCodeSelections,
      getCodesByGroup,
      getEditor,
      setEditor,
      getEditors,
    },
    dragHandlers: {
      startNodeDrag,
      handleNodeDrag,
    },
  };
}
