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
    const codeTheme = codes.find((code) => code.id === codeId);
    if (!codeTheme) return;

    // Get existing theme marks in the selection
    const existingMarks = editor.state.doc.rangeHasMark(
      from,
      to,
      editor.schema.marks.themeMark
    );
    let currentThemeIds: string[] = [];
    let currentColors: string[] = [];

    if (existingMarks) {
      // Get all theme marks in the selection
      editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.marks) {
          node.marks.forEach((mark) => {
            if (mark.type.name === "themeMark") {
              if (mark.attrs.themeId) {
                const themeIds = Array.isArray(mark.attrs.themeId)
                  ? mark.attrs.themeId
                  : [mark.attrs.themeId];
                currentThemeIds = [
                  ...new Set([...currentThemeIds, ...themeIds]),
                ];
              }
              if (mark.attrs.color) {
                const colors = Array.isArray(mark.attrs.color)
                  ? mark.attrs.color
                  : [mark.attrs.color];
                currentColors = [...new Set([...currentColors, ...colors])];
              }
            }
          });
        }
      });
    }

    // If the theme ID already exists, do nothing
    if (currentThemeIds.includes(codeTheme.id)) {
      return;
    }

    // Add the new theme ID and color
    currentThemeIds.push(codeTheme.id);
    currentColors.push(codeTheme.color);

    controls.addCodeSelection(codeId, {
      start: from,
      end: to,
      text,
      nodeId,
    });

    editor
      .chain()
      .focus()
      .setThemeMark({ themeId: currentThemeIds, color: currentColors })
      .run();
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      shouldShow={({ editor }) => {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        return (
          !editor.state.selection.empty && text.trim().length > 0
          //&& !editor.isFocused
        );
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
