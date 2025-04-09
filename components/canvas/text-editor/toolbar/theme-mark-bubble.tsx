"use client";

import { useCallback, useEffect, useState } from "react";
import { Editor } from "@tiptap/react";
import { useCanvas } from "../../useCanvas";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Code } from "../../types";

interface ThemeMarkBubbleProps {
  editor: Editor;
}

export const ThemeMarkBubble = ({ editor }: ThemeMarkBubbleProps) => {
  const { canvas } = useCanvas();
  const { codes } = canvas;
  const [isVisible, setIsVisible] = useState(false);
  const [themeIds, setThemeIds] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);

  const handleThemeMarkClick = useCallback(
    (themeIds: string[], colors: string[]) => {
      console.log("Theme IDs:", themeIds);
      console.log("Colors:", colors);
      setThemeIds(themeIds);
      setColors(colors);
      setIsVisible(true);
    },
    []
  );

  useEffect(() => {
    if (!editor) return;

    // Configure the theme mark with our click handler
    editor.extensionManager.extensions.forEach((extension) => {
      if (extension.name === "themeMark") {
        extension.options.onThemeMarkClick = handleThemeMarkClick;
      }
    });

    // Add click event listener to theme marks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("theme-mark")) {
        const themeIdAttr = target.getAttribute("data-theme-id");
        const colorAttr = target.getAttribute("data-theme-color");

        if (themeIdAttr && colorAttr) {
          try {
            const themeIds = JSON.parse(themeIdAttr);
            const colors = JSON.parse(colorAttr);
            handleThemeMarkClick(themeIds, colors);
          } catch (error) {
            console.error("Error parsing theme mark attributes:", error);
          }
        }
      }
    };

    editor.view.dom.addEventListener("click", handleClick);
    return () => {
      editor.view.dom.removeEventListener("click", handleClick);
    };
  }, [editor, handleThemeMarkClick]);

  if (!isVisible) return null;

  return (
    <div className="absolute bg-white shadow-md rounded-md p-2 flex flex-col gap-1 items-start min-w-[200px] z-50">
      <div className="flex items-center justify-between w-full">
        <h3 className="font-semibold">Theme Marks</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="w-full border-t pt-2">
        {themeIds.map((themeId, index) => {
          const code = codes.find((c: Code) => c.id === themeId);
          if (!code) return null;
          return (
            <div key={themeId} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index] }}
              />
              <span>{code.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
