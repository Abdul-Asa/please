"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bookmark, Info, Trash2 } from "lucide-react";
import { useCanvas } from "../useCanvas";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function CodeManager() {
  const { canvas, controls } = useCanvas();
  const { codes } = canvas;
  const { deleteCode } = controls;
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          tooltip="Code Manager"
          tooltipSide="bottom"
        >
          <Bookmark size={18} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Code Manager</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {codes.map((code) => (
            <div
              key={code.id}
              className="flex items-center justify-between p-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: code.color }}
                />
                <span className="truncate">{code.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      tooltip="Code Info"
                    >
                      <Info size={16} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium">Comments</h4>
                        <p className="text-sm text-muted-foreground">
                          {code.comment || "No comment"}
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-destructive"
                  onClick={() => deleteCode(code.id)}
                  tooltip="Delete Code"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
