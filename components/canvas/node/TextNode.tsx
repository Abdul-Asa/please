import { TextNode } from "../types";
import { useCanvas } from "../useCanvas";
import { Editor } from "../text-editor";

export function TextNodeContent({ node }: { node: TextNode }) {
  const { controls } = useCanvas();

  const handleContentChange = (newContent: string) => {
    controls.updateNode(node.id, { text: newContent });
  };

  return (
    <Editor
      content={node.text}
      onChange={handleContentChange}
      nodeId={node.id}
    />
  );
}
