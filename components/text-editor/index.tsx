"use client";

import { Separator } from "@/components/ui/separator";
import { EditorContent, type Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BlockquoteToolbar } from "./toolbar/blockquote";
import { BoldToolbar } from "./toolbar/bold";
import { BulletListToolbar } from "./toolbar/bullet-list";
import { CodeToolbar } from "./toolbar/code";
import { CodeBlockToolbar } from "./toolbar/code-block";
import { HardBreakToolbar } from "./toolbar/hard-break";
import { HorizontalRuleToolbar } from "./toolbar/horizontal-rule";
import { ItalicToolbar } from "./toolbar/italic";
import { OrderedListToolbar } from "./toolbar/ordered-list";
import { RedoToolbar } from "./toolbar/redo";
import { StrikeThroughToolbar } from "./toolbar/strikethrough";
import { ToolbarProvider } from "./toolbar/toolbar-provider";
import { UndoToolbar } from "./toolbar/undo";
import { cn } from "@/lib/utils";

const extensions = [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal",
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: "list-disc",
      },
    },
    code: {
      HTMLAttributes: {
        class: "bg-accent rounded-md p-1",
      },
    },
    horizontalRule: {
      HTMLAttributes: {
        class: "my-2",
      },
    },
    codeBlock: {
      HTMLAttributes: {
        class: "bg-primary text-primary-foreground p-2 text-sm rounded-md p-1",
      },
    },
    heading: {
      levels: [1, 2, 3, 4],
      HTMLAttributes: {
        class: "tiptap-heading",
      },
    },
  }),
];

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  className?: string;
}

const Editor = ({ content = "<p></p>", onChange, className }: EditorProps) => {
  const editor = useEditor({
    extensions: extensions as Extension[],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }
  return (
    <div
      className={cn(
        "w-full relative overflow-hidden pb-3 h-full flex flex-col",
        className
      )}
    >
      <div className="flex w-full items-center py-2 px-2 justify-between border-b sticky top-0 left-0 bg-background z-20">
        <ToolbarProvider editor={editor}>
          <div className="flex items-center gap-2">
            <UndoToolbar />
            <RedoToolbar />
            <Separator orientation="vertical" className="h-7" />
            <BoldToolbar />
            <ItalicToolbar />
            <StrikeThroughToolbar />
            <BulletListToolbar />
            <OrderedListToolbar />
            <CodeToolbar />
            <CodeBlockToolbar />
            <HorizontalRuleToolbar />
            <BlockquoteToolbar />
            <HardBreakToolbar />
          </div>
        </ToolbarProvider>
      </div>
      <div
        onClick={() => {
          editor?.chain().focus().run();
        }}
        className="cursor-text min-h-[18rem] p-2 flex-1 overflow-auto bg-background"
      >
        <EditorContent className="outline-none h-full" editor={editor} />
      </div>
    </div>
  );
};

export { Editor };
