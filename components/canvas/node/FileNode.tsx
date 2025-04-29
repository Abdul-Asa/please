import { FileNode } from "../types";
import { useCanvas } from "../useCanvas";
import { Editor } from "../text-editor";
import { JSONContent } from "@tiptap/react";

export function FileNodeContent({ node }: { node: FileNode }) {
  const {
    controls: { updateNode },
    canvas: { codes, codeGroups },
  } = useCanvas();

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

  if (node.fileType === "image") {
    return (
      <div className="flex items-center justify-center h-full w-full overflow-scroll">
        <img
          src={node.content as string}
          alt={node.file}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  if (node.fileType === "text") {
    return (
      <Editor
        content={node.content as string}
        onChange={handleContentChange}
        nodeId={node.id}
        codes={codes}
        codeGroups={codeGroups}
      />
    );
  }
}
