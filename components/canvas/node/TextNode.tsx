import { TextNode } from "../types";
import { useCanvas } from "../useCanvas";
import { Editor } from "../text-editor";
import { JSONContent } from "@tiptap/react";

export function TextNodeContent({ node }: { node: TextNode }) {
  const { controls } = useCanvas();

  const handleContentChange = ({
    content,
    text,
  }: {
    content: string;
    text: JSONContent;
  }) => {
    controls.updateNode(node.id, {
      text: content,
      vrText: text,
    });
  };

  return (
    <Editor
      content={node.text}
      onChange={handleContentChange}
      nodeId={node.id}
    />
  );
}
