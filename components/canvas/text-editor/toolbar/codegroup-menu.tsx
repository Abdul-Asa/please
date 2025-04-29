import { BubbleMenu, Editor } from "@tiptap/react";
import type { Code, CodeGroup } from "../../types";
import { OctagonXIcon, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const CodeGroupMenu = ({
  editor,
  codes,
  codeGroups,
}: {
  editor: Editor;
  codes: Code[];
  codeGroups: CodeGroup[];
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const isCodeApplied = (codeId: string) => {
    const { from, to } = editor.state.selection;
    const existingMarks = editor.state.doc.rangeHasMark(
      from,
      to,
      editor.schema.marks.themeMark
    );
    let currentThemeIds: string[] = [];

    if (existingMarks) {
      editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.marks) {
          node.marks.forEach((mark) => {
            if (mark.type.name === "themeMark" && mark.attrs.themeId) {
              const themeIds = Array.isArray(mark.attrs.themeId)
                ? mark.attrs.themeId
                : [mark.attrs.themeId];
              currentThemeIds = [...new Set([...currentThemeIds, ...themeIds])];
            }
          });
        }
      });
    }

    return currentThemeIds.includes(codeId);
  };

  const handleCodeToggle = (codeId: string) => {
    const { from, to } = editor.state.selection;
    const codeTheme = codes.find((code) => code.id === codeId);
    if (!codeTheme) return;

    const existingMarks = editor.state.doc.rangeHasMark(
      from,
      to,
      editor.schema.marks.themeMark
    );
    let currentThemeIds: string[] = [];
    let currentColors: string[] = [];
    let themeColorPairs: { id: string; color: string }[] = [];

    if (existingMarks) {
      editor.state.doc.nodesBetween(from, to, (node) => {
        if (node.marks) {
          node.marks.forEach((mark) => {
            if (mark.type.name === "themeMark") {
              if (mark.attrs.themeId && mark.attrs.color) {
                const themeIds = Array.isArray(mark.attrs.themeId)
                  ? mark.attrs.themeId
                  : [mark.attrs.themeId];
                const colors = Array.isArray(mark.attrs.color)
                  ? mark.attrs.color
                  : [mark.attrs.color];

                // Keep track of theme-color pairs
                themeColorPairs = themeIds.map((id, index) => ({
                  id,
                  color: colors[index],
                }));
              }
            }
          });
        }
      });
    }

    if (themeColorPairs.some((pair) => pair.id === codeTheme.id)) {
      // Remove the code
      themeColorPairs = themeColorPairs.filter(
        (pair) => pair.id !== codeTheme.id
      );
    } else {
      // Add the code
      themeColorPairs.push({ id: codeTheme.id, color: codeTheme.color });
    }

    // Convert pairs back to separate arrays
    currentThemeIds = themeColorPairs.map((pair) => pair.id);
    currentColors = themeColorPairs.map((pair) => pair.color);

    if (currentThemeIds.length === 0) {
      editor.chain().focus().unsetThemeMark().run();
    } else {
      editor
        .chain()
        .focus()
        .setThemeMark({ themeId: currentThemeIds, color: currentColors })
        .run();
    }
  };

  // Group codes by their groupId
  const groupedCodes = new Map<string, Code[]>();
  const ungroupedCodes: Code[] = [];

  codes.forEach((code) => {
    if (code.groupId) {
      if (!groupedCodes.has(code.groupId)) {
        groupedCodes.set(code.groupId, []);
      }
      if (code.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        groupedCodes.get(code.groupId)?.push(code);
      }
    } else if (code.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      ungroupedCodes.push(code);
    }
  });

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "bottom-start",
        offset: [0, 10],
        interactive: true,
      }}
      shouldShow={({ editor }) => {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        return !editor.state.selection.empty && text.trim().length > 0;
      }}
      className="bg-background shadow-md border rounded-md flex flex-col min-w-[300px] max-h-[300px] overflow-hidden"
    >
      <div className="p-2 border-b">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-[10px] h-8"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {codes.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center gap-2 py-4">
            <OctagonXIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No codes available</p>
          </div>
        )}

        {/* Ungrouped codes */}
        {ungroupedCodes.length > 0 && (
          <div className="w-full space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
              Ungrouped
            </div>
            <div className="space-y-2">
              {ungroupedCodes.map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between gap-2 px-2"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: code.color }}
                    />
                    <span className="text-sm">{code.name}</span>
                  </div>
                  <div onMouseDown={(e) => e.preventDefault()}>
                    <Switch
                      checked={isCodeApplied(code.id)}
                      onCheckedChange={() => handleCodeToggle(code.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grouped codes */}
        {codeGroups.map((group) => {
          const groupCodes = groupedCodes.get(group.id) || [];
          if (groupCodes.length === 0) return null;

          return (
            <div key={group.id} className="w-full space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                {group.name}
              </div>
              <div className="space-y-2">
                {groupCodes.map((code) => (
                  <div
                    key={code.id}
                    className="flex items-center justify-between gap-2 px-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: code.color }}
                      />
                      <span className="text-sm">{code.name}</span>
                    </div>
                    <div onMouseDown={(e) => e.preventDefault()}>
                      <Switch
                        checked={isCodeApplied(code.id)}
                        onCheckedChange={() => handleCodeToggle(code.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </BubbleMenu>
  );
};
