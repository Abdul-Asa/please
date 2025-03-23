import { cn } from "@/lib/utils";
import { BubbleMenu, Editor } from "@tiptap/react";

const HIGHLIGHT_COLORS = [
  { name: "green", class: "text-green-500 bg-green-50" },
  { name: "yellow", class: "text-yellow-600 bg-yellow-50" },
  { name: "blue", class: "text-blue-500 bg-blue-50" },
  { name: "red", class: "text-red-500 bg-red-50" },
];

export const CodeGroupMenu = ({ editor }: { editor: Editor }) => {
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      shouldShow={({ editor }) => {
        return editor.isActive("highlight") || !editor.state.selection.empty;
      }}
      className="bg-white shadow-md rounded-md p-2 flex gap-2 items-center"
    >
      {HIGHLIGHT_COLORS.map((color) => (
        <button
          key={color.name}
          onClick={() =>
            editor.chain().focus().toggleHighlight({ color: color.name }).run()
          }
          className={cn(
            "p-1 px-2 rounded hover:bg-gray-100",
            editor.isActive("highlight", { color: color.name })
              ? "ring-2 ring-gray-200"
              : ""
          )}
        >
          <span className={color.class}>Highlight</span>
        </button>
      ))}
    </BubbleMenu>
  );
};
