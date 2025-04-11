"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  ChevronDown,
  ChevronRight,
  Info,
  Trash2,
  Plus,
} from "lucide-react";
import { useCanvas } from "../useCanvas";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sortable,
  SortableItem,
  SortableDragHandle,
} from "@/components/ui/sortable";
import type { Code, CodeGroup, CodeSelection } from "../types";

export function CodeManager() {
  const { canvas, controls } = useCanvas();
  const { codes, codeGroups } = canvas;
  const {
    deleteCode,
    addCodeGroup,
    updateCode,
    getCodeSelections,
    scrollToCodeSelection,
    getCodesByGroup,
  } = controls;
  const [open, setOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const { groupedCodes, ungroupedCodes } = getCodesByGroup();

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      addCodeGroup({ name: newGroupName });
      setNewGroupName("");
      setIsCreateGroupOpen(false);
    }
  };

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
          <SheetDescription>
            Manage your codes and their associated theme marks.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <Dialog
              open={isCreateGroupOpen}
              onOpenChange={setIsCreateGroupOpen}
            >
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Code Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    placeholder="Group name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                  <Button className="w-full" onClick={handleCreateGroup}>
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {codes.map((code) => {
              const marks = getCodeSelections(code.id);
              return (
                <div key={code.id}>
                  <p>{code.name}</p>
                  <p>
                    {marks.map((mark) => (
                      <span
                        key={`${mark.from}-${mark.to}`}
                        onClick={() => {
                          scrollToCodeSelection(mark);
                          setOpen(false);
                        }}
                        className="underline cursor-pointer"
                      >
                        {mark.text}
                      </span>
                    ))}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
