import { cn } from "@/lib/utils";
import { BubbleMenu, Editor } from "@tiptap/react";
import { useCanvas } from "../../useCanvas";
import { Button } from "@/components/ui/button";
import type { Code } from "../../types";

export const CodeGroupMenu = ({
  editor,
  nodeId,
}: {
  editor: Editor;
  nodeId: string;
}) => {
  const { canvas, controls } = useCanvas();
  const { codes } = canvas;

  const handleCodeSelect = (codeId: string) => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);
    const codeColor = codes.find((code) => code.id === codeId)?.color;
    if (!codeColor) return;
    controls.addCodeSelection(codeId, {
      start: from,
      end: to,
      text,
      nodeId,
    });

    editor.chain().focus().setHighlight({ color: codeColor }).run();
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      shouldShow={({ editor }) => {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        return !editor.state.selection.empty && text.trim().length > 0;
      }}
      className="bg-white shadow-md rounded-md p-2 flex flex-col gap-1 items-start min-w-[200px]"
    >
      {codes.map((code: Code) => (
        <Button
          key={code.id}
          variant="ghost"
          className={cn("w-full justify-start text-left", "hover:bg-gray-100")}
          onClick={() => handleCodeSelect(code.id)}
        >
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: code.color }}
          />
          {code.name}
        </Button>
      ))}
    </BubbleMenu>
  );
};
