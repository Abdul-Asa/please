import { FileTextIcon, Loader2, XIcon, FileIcon } from "lucide-react";
import { FileContent } from "../types";
import { getFileContent } from "../store";
import { FileNode } from "../types";
import { useEffect, useState } from "react";
import { Editor } from "../text-editor";
import { useCanvas } from "../useCanvas";

export function FileNodeContent({
  node,
  isExpanded = false,
}: {
  node: FileNode;
  isExpanded?: boolean;
}) {
  const [fileContent, setFileContent] = useState<FileContent | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { controls } = useCanvas();

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
  }, [node.id]);

  const handleTextContentChange = (newContent: string) => {
    if (fileContent?.type === "text") {
      // Update the file content in the store
      setFileContent({
        ...fileContent,
        content: newContent,
      });

      // If there's a need to save this to a backend or persistent storage,
      // that would be implemented here
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
      <div className="h-full w-full">
        {isExpanded ? (
          <Editor
            content={fileContent.content as string}
            onChange={handleTextContentChange}
            nodeId={node.id}
          />
        ) : (
          <div
            className="p-2 prose prose-sm max-w-none overflow-auto max-h-[300px]"
            dangerouslySetInnerHTML={{ __html: fileContent.content as string }}
          />
        )}
      </div>
    );
  }

  if (fileContent.type === "pdf") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <div className="w-full h-full overflow-auto flex justify-center">
          <iframe
            src={fileContent.content as string}
            className="w-full h-full border-0"
            title={fileContent.name || "PDF Document"}
            sandbox="allow-scripts allow-same-origin"
          >
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <p className="text-sm text-destructive">
                Unable to display PDF.{" "}
                <a
                  href={fileContent.content as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Download instead
                </a>
              </p>
            </div>
          </iframe>
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
