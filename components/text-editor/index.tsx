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

const content = `
<h2 class="tiptap-heading" style="text-align: center">Hello world 🌍</h2>
`;

const Editor = () => {
  const editor = useEditor({
    extensions: extensions as Extension[],
    content,
    immediatelyRender: false,
  });

  if (!editor) {
    return null;
  }
  return (
    <div className="border w-full relative rounded-md overflow-hidden pb-3">
      <div className="flex w-full items-center py-2 px-2 justify-between border-b  sticky top-0 left-0 bg-background z-20">
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
        className="cursor-text min-h-[18rem] bg-background"
      >
        <EditorContent className="outline-none" editor={editor} />
      </div>
    </div>
  );
};

export { Editor };
