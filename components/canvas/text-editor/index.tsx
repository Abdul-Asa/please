"use client";

import { Separator } from "@/components/ui/separator";
import { EditorContent, type Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { ThemeMark } from "./extensions/theme-mark";
import {
  BlockquoteToolbar,
  BoldToolbar,
  BulletListToolbar,
  CodeBlockToolbar,
  CodeToolbar,
  HardBreakToolbar,
  HeadingToolbar,
  HorizontalRuleToolbar,
  ItalicToolbar,
  OrderedListToolbar,
  RedoToolbar,
  StrikeThroughToolbar,
  UndoToolbar,
  ToolbarProvider,
  CodeGroupMenu,
} from "./toolbar";

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
      levels: [1, 2, 3],
      HTMLAttributes: {
        class: "tiptap-heading",
      },
    },
  }),
  ThemeMark.configure({
    HTMLAttributes: {
      class: "theme-mark",
    },
  }),
];

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  className?: string;
  isExpanded?: boolean;
  nodeId: string;
}

const Editor = ({
  content,
  onChange,
  className,
  isExpanded,
  nodeId,
}: EditorProps) => {
  const [isEditable, setIsEditable] = useState(isExpanded || false);

  const editor = useEditor({
    extensions: extensions as Extension[],
    content,
    editable: isEditable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
      setIsEditable(editor.isEditable);
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(isExpanded || false);
    }
    if (isExpanded) {
      editor?.chain().focus("end").run();
    }
  }, [isExpanded, editor]);

  if (!editor) {
    return null;
  }
  return (
    <div
      className={cn(
        "w-full flex-1 relative pb-3 h-full flex flex-col overflow-auto",
        className
      )}
    >
      {editor && <CodeGroupMenu editor={editor} nodeId={nodeId} />}

      {isEditable && (
        <div className="flex w-full items-center overflow-scroll py-2 px-2 justify-between border-b sticky top-0 left-0 bg-background z-20">
          <ToolbarProvider editor={editor}>
            <div className="flex items-center gap-2">
              <UndoToolbar />
              <RedoToolbar />
              <Separator orientation="vertical" className="h-7" />
              <BoldToolbar />
              <ItalicToolbar />
              <StrikeThroughToolbar />
              <HeadingToolbar />
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
      )}

      <div
        onClick={() => {
          editor?.chain().focus().run();
        }}
        className="h-full flex-1 overflow-auto"
      >
        <EditorContent
          className="outline-none flex-1 h-full w-full"
          editor={editor}
        />
      </div>
    </div>
  );
};

export { Editor };
