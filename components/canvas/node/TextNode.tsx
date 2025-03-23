import { useEffect } from "react";
import { TextNode } from "../types";
import { useCanvas } from "../useCanvas";
import { Editor } from "../text-editor";

export function TextNodeContent({
  node,
  isExpanded,
}: {
  node: TextNode;
  isExpanded: boolean;
}) {
  const { controls } = useCanvas();

  const handleContentChange = (newContent: string) => {
    controls.updateNode(node.id, { text: newContent });
  };

  return (
    <Editor
      content={node.text}
      onChange={handleContentChange}
      isExpanded={isExpanded}
      nodeId={node.id}
    />
  );
}
