import { useEffect, useState } from "react";
import { FileContent, FileNode } from "../types";
import { useCanvas } from "../useCanvas";
import { FileTextIcon } from "lucide-react";
import { getFileContent, storeFileContent } from "../store";
import { Editor } from "../text-editor";

export function FileNodeContent({ node }: { node: FileNode }) {
  const {
    controls: { updateNode },
  } = useCanvas();
  const [fileContent, setFileContent] = useState<FileContent>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        setLoading(true);
        const content = await getFileContent(node.id);
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
  }, [node.fileType, node.file]);

  const handleContentChange = ({
    content,
    text,
  }: {
    content: string;
    text: string;
  }) => {
    if (fileContent?.type === "text") {
      setFileContent({
        ...fileContent,
        content: content,
      });
      updateNode(node.id, {
        vrText: text,
      });
      storeFileContent(fileContent);
    }
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
      <Editor
        content={fileContent.content as string}
        onChange={handleContentChange}
        nodeId={node.id}
      />
    );
  }
}
