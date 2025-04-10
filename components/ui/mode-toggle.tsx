"use client";

import * as React from "react";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //...
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent align="end">
    //     <DropdownMenuItem onClick={() => setTheme("light")}>
    //       <Sun className="h-[1.2rem] w-[1.2rem]" />
    //       <span className="ml-2">Light</span>
    //       {theme === "light" && <Check className="ml-auto h-4 w-4" />}
    //     </DropdownMenuItem>
    //     <DropdownMenuItem onClick={() => setTheme("dark")}>
    //       <Moon className="h-[1.2rem] w-[1.2rem]" />
    //       <span className="ml-2">Dark</span>
    //       {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
    //     </DropdownMenuItem>
    //     <DropdownMenuItem onClick={() => setTheme("system")}>
    //       <Monitor className="h-[1.2rem] w-[1.2rem]" />
    //       <span className="ml-2">System</span>
    //       {theme === "system" && <Check className="ml-auto h-4 w-4" />}
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
    <Button
      variant="ghost"
      size="icon"
      tooltip="Toggle Theme"
      tooltipSide="bottom"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
