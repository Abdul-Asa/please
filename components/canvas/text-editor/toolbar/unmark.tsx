"use client";

import { X } from "lucide-react";
import React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "./toolbar-provider";

const UnmarkToolbar = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", className)}
            onClick={(e) => {
              editor?.chain().focus().unsetThemeMark().run();
              onClick?.(e);
            }}
            disabled={!editor?.isActive("themeMark")}
            ref={ref}
            {...props}
          >
            {children || <X className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Remove theme mark</span>
        </TooltipContent>
      </Tooltip>
    );
  }
);

UnmarkToolbar.displayName = "UnmarkToolbar";

export { UnmarkToolbar };
