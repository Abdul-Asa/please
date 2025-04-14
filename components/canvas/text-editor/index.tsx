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
  UnmarkToolbar,
  ThemeMarkBubble,
} from "./toolbar";
import Highlight from "@tiptap/extension-highlight";
import { motion } from "motion/react";
import { useCanvas } from "../useCanvas";

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
  Highlight.configure({
    multicolor: true,
    HTMLAttributes: {
      class: "bg-primary text-primary-foreground",
    },
  }),
];

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  className?: string;
  nodeId: string;
}

const Editor = ({ content, onChange, className, nodeId }: EditorProps) => {
  const { canvas, controls } = useCanvas();
  const { viewport } = canvas;
  const isExpanded = viewport.expandedNodeId === nodeId;
  const [isEditable, setIsEditable] = useState(isExpanded || false);

  const editor = useEditor({
    extensions: extensions as Extension[],
    content,
    editable: isEditable,
    immediatelyRender: false,
    editorProps: {
      scrollThreshold: 180,
      scrollMargin: 180,
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
      setIsEditable(editor.isEditable);
    },
    onCreate: ({ editor }) => {
      controls.setEditor(nodeId, editor);
    },
    onDestroy: () => {
      controls.setEditor(nodeId, undefined);
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(isExpanded || false);
    }
    if (isExpanded) {
      editor?.chain().focus().run();
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
      {editor && <ThemeMarkBubble editor={editor} />}
      {isEditable && (
        <div className="flex w-full items-center overflow-x-auto overflow-y-hidden py-2 px-2 justify-start border-b sticky top-0 left-0 bg-background dark:bg-[#1e0516] z-20 border-border">
          <ToolbarProvider editor={editor}>
            <div className="flex items-center gap-2 min-w-max">
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
              <Separator orientation="vertical" className="h-7" />
              <UnmarkToolbar />
            </div>
          </ToolbarProvider>
        </div>
      )}
      <motion.div
        layout="position"
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 35,
          mass: 1.2,
          duration:
            viewport.isDragging || viewport.isPanning || viewport.isScrolling
              ? 0
              : 0.4,
        }}
        onClick={() => {
          editor?.chain().focus().run();
        }}
        className="h-full flex-1 overflow-auto"
      >
        <EditorContent
          className="outline-none flex-1 h-full w-full"
          editor={editor}
        />
      </motion.div>
    </div>
  );
};

export { Editor };
