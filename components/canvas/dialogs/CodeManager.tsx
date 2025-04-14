"use client";

import * as React from "react";
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
  X,
  GripVertical,
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
  DialogDescription,
} from "@/components/ui/dialog";
import type { Code, CodeSelection, CodeGroup } from "../types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { ExportDialog } from "./ExportDialog";
import { ImportDialog } from "./ImportDialog";

function SortableCode({
  isOpen,
  code,
  onDelete,
  onToggle,
  isExpanded,
  selections,
  scrollToCodeSelection,
  setOpen,
}: {
  isOpen: boolean;
  code: Code;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  isExpanded: boolean;
  selections: CodeSelection[];
  scrollToCodeSelection: (selection: CodeSelection) => void;
  setOpen: (open: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: code.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="space-y-1">
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center justify-between p-2 rounded-md group bg-background"
      >
        <div className="flex items-center gap-2 flex-1">
          <div
            className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <Button
            variant="ghost"
            className="flex-1 justify-start p-0 h-auto hover:bg-transparent"
            onClick={() => onToggle(code.id)}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-2 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2 text-muted-foreground" />
            )}
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: code.color }}
              />
              <span className="text-sm font-medium">{code.name}</span>
              <span className="text-xs text-muted-foreground">
                ({selections.length})
              </span>
            </div>
          </Button>
        </div>
        <div className="flex gap-1">
          <Popover modal={isOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: code.color }}
                  />
                  <h4 className="font-medium">{code.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {code.comment || "No description provided"}
                </p>
                <div className="text-xs text-muted-foreground">
                  {selections.length} selections
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(code.id)}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      {isExpanded && selections.length > 0 && (
        <div className="pl-10 space-y-1">
          {selections.map((selection) => (
            <Button
              key={`${selection.nodeId}-${selection.from}-${selection.to}`}
              variant="ghost"
              className="w-full justify-start text-sm h-auto py-1 px-2 hover:bg-accent/50"
              onClick={() => {
                scrollToCodeSelection(selection);
                setOpen(false);
              }}
            >
              <span className="truncate text-xs">{selection.text}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function GroupHeader({
  group,
  isExpanded,
  onToggle,
  onDelete,
  isDeleteOpen,
  selectedGroupId,
  setIsDeleteOpen,
  setSelectedGroupId,
  deleteOption,
  setDeleteOption,
  codeCount,
}: {
  group: CodeGroup;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onDelete: () => void;
  isDeleteOpen: boolean;
  selectedGroupId: string | null;
  setIsDeleteOpen: (open: boolean) => void;
  setSelectedGroupId: (id: string | null) => void;
  deleteOption: "move" | "delete";
  setDeleteOption: (option: "move" | "delete") => void;
  codeCount: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `group-${group.id}`,
  });

  return (
    <div className="flex items-center justify-between">
      <Button
        ref={setNodeRef}
        variant="ghost"
        className={cn("w-full justify-start p-2", isOver && "bg-accent/50")}
        onClick={() => onToggle(group.id)}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 mr-2" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2" />
        )}
        <span className="font-medium">{group.name}</span>
        <span className="ml-2 text-xs text-muted-foreground">
          ({codeCount})
        </span>
      </Button>
      <Dialog
        open={isDeleteOpen && selectedGroupId === group.id}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setSelectedGroupId(null);
            setDeleteOption("move");
          }
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setSelectedGroupId(group.id);
              setIsDeleteOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Choose what happens to the codes in this group when you delete it.
              You can either move them to ungrouped or delete them permanently.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <p>
              You are about to delete the group "{group.name}".
              {codeCount
                ? ` This group contains ${codeCount} code${
                    codeCount === 1 ? "" : "s"
                  }.`
                : ""}
            </p>
            <RadioGroup
              value={deleteOption}
              onValueChange={(value: string) =>
                setDeleteOption(value as "move" | "delete")
              }
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="move" id="move" />
                <Label htmlFor="move">
                  Delete group and move codes to ungrouped
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delete" id="delete" />
                <Label htmlFor="delete" className="text-destructive">
                  Delete group and all its codes
                </Label>
              </div>
            </RadioGroup>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsDeleteOpen(false);
                  setSelectedGroupId(null);
                  setDeleteOption("move");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={onDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UngroupedHeader({
  isExpanded,
  onToggle,
  codeCount,
}: {
  isExpanded: boolean;
  onToggle: (id: string) => void;
  codeCount: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "group-ungrouped",
  });

  return (
    <div className="flex items-center justify-between">
      <Button
        ref={setNodeRef}
        variant="ghost"
        className={cn("w-full justify-start p-2", isOver && "bg-accent/50")}
        onClick={() => onToggle("ungrouped")}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 mr-2" />
        ) : (
          <ChevronRight className="w-4 h-4 mr-2" />
        )}
        <span className="font-medium">Ungrouped</span>
        <span className="ml-2 text-xs text-muted-foreground">
          ({codeCount})
        </span>
      </Button>
    </div>
  );
}

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
    deleteCodeGroup,
    addCode,
  } = controls;
  const [open, setOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initialSet = new Set(["ungrouped"]);
    codeGroups.forEach((group) => initialSet.add(group.id));
    return initialSet;
  });
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());
  const [deleteOption, setDeleteOption] = useState<"move" | "delete">("move");
  const { groupedCodes, ungroupedCodes } = getCodesByGroup();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const findCodeGroup = (codeId: string) => {
    if (ungroupedCodes.some((code) => code.id === codeId)) {
      return "ungrouped";
    }
    for (const [groupId, groupCodes] of groupedCodes.entries()) {
      if (groupCodes.some((code) => code.id === codeId)) {
        return groupId;
      }
    }
    return null;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeGroupId = findCodeGroup(active.id as string);
    const overId = over.id as string;

    // Check if we're dropping onto a group header
    if (overId.startsWith("group-")) {
      const targetGroupId = overId.replace("group-", "");
      if (activeGroupId !== targetGroupId) {
        // Move code to new group
        const code = codes.find((c) => c.id === active.id);
        if (code) {
          updateCode(code.id, {
            groupId: targetGroupId === "ungrouped" ? undefined : targetGroupId,
          });
        }
      }
      return;
    }

    // Handle dropping onto other codes
    const overGroupId = findCodeGroup(overId);
    if (!activeGroupId || !overGroupId) return;

    if (activeGroupId !== overGroupId) {
      // Move code to new group
      const code = codes.find((c) => c.id === active.id);
      if (code) {
        updateCode(code.id, {
          groupId: overGroupId === "ungrouped" ? undefined : overGroupId,
        });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeGroupId = findCodeGroup(active.id as string);
    const overId = over.id as string;

    // Check if we're dropping onto a group header
    if (overId.startsWith("group-")) {
      const targetGroupId = overId.replace("group-", "");
      if (activeGroupId !== targetGroupId) {
        // Move code to new group
        const code = codes.find((c) => c.id === active.id);
        if (code) {
          updateCode(code.id, {
            groupId: targetGroupId === "ungrouped" ? undefined : targetGroupId,
          });
        }
      }
      return;
    }

    // Handle reordering within the same group
    const overGroupId = findCodeGroup(overId);
    if (!activeGroupId || !overGroupId || activeGroupId !== overGroupId) return;

    const activeCodes =
      activeGroupId === "ungrouped"
        ? ungroupedCodes
        : groupedCodes.get(activeGroupId) || [];

    const activeIndex = activeCodes.findIndex((code) => code.id === active.id);
    const overIndex = activeCodes.findIndex((code) => code.id === over.id);

    if (activeIndex !== overIndex) {
      // Reorder within the same group
      const newOrder = arrayMove(activeCodes, activeIndex, overIndex);
      newOrder.forEach((code, index) => {
        updateCode(code.id, { order: index });
      });
    }
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      addCodeGroup({ name: newGroupName });
      setNewGroupName("");
      setIsCreateGroupOpen(false);
    }
  };

  const handleDeleteGroup = () => {
    if (!selectedGroupId) return;

    const groupCodes = groupedCodes.get(selectedGroupId) || [];

    if (deleteOption === "move") {
      // Move codes to ungrouped
      groupCodes.forEach((code) => {
        updateCode(code.id, { groupId: undefined });
      });
    } else {
      // Delete all codes in the group
      groupCodes.forEach((code) => {
        deleteCode(code.id);
      });
    }

    deleteCodeGroup(selectedGroupId);
    setIsDeleteGroupOpen(false);
    setSelectedGroupId(null);
    setDeleteOption("move");
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const toggleCode = (codeId: string) => {
    setExpandedCodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(codeId)) {
        newSet.delete(codeId);
      } else {
        newSet.add(codeId);
      }
      return newSet;
    });
  };

  const handleImport = (importedCodes: Code[], importedGroups: CodeGroup[]) => {
    // Clear existing codes and groups
    codes.forEach((code) => deleteCode(code.id));
    codeGroups.forEach((group) => deleteCodeGroup(group.id));

    // Create a mapping between old and new group IDs
    const groupIdMap = new Map<string, string>();

    // Add imported groups and store the mapping
    importedGroups.forEach((group) => {
      const newGroup = addCodeGroup({ name: group.name });
      groupIdMap.set(group.id, newGroup.id);
    });

    // Add imported codes with mapped group IDs
    importedCodes.forEach((code) => {
      addCode({
        name: code.name,
        color: code.color,
        comment: code.comment,
        groupId: code.groupId ? groupIdMap.get(code.groupId) : undefined,
      });
    });
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
      <SheetContent side="right" className="sm:w-[400px] w-[calc(100vw-2rem)] ">
        <SheetHeader>
          <SheetTitle>Code Manager</SheetTitle>
          <SheetDescription>
            Manage your codes and their associated theme marks.
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-2 mt-4 mb-4">
          <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 h-10">
                <Plus className="w-4 h-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Code Group</DialogTitle>
                <DialogDescription>
                  Organize your codes by creating groups. Groups help you
                  categorize and manage related codes together.
                </DialogDescription>
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

          <ImportDialog
            codes={codes}
            codeGroups={codeGroups}
            onImport={handleImport}
          />

          <ExportDialog codes={codes} codeGroups={codeGroups} />
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4 overflow-auto h-[calc(100vh-220px)]">
            {/* Ungrouped Codes */}
            <div>
              <UngroupedHeader
                isExpanded={expandedGroups.has("ungrouped")}
                onToggle={toggleGroup}
                codeCount={ungroupedCodes.length}
              />
              {expandedGroups.has("ungrouped") && (
                <div className="pl-6">
                  <SortableContext
                    items={ungroupedCodes.map((code) => code.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1">
                      {ungroupedCodes.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground">
                          No codes in ungrouped
                        </div>
                      )}
                      {ungroupedCodes.map((code) => (
                        <SortableCode
                          key={code.id}
                          code={code}
                          onDelete={deleteCode}
                          isOpen={open}
                          onToggle={toggleCode}
                          isExpanded={expandedCodes.has(code.id)}
                          selections={getCodeSelections(code.id)}
                          scrollToCodeSelection={scrollToCodeSelection}
                          setOpen={setOpen}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              )}
            </div>

            {/* Grouped Codes */}
            {codeGroups.map((group) => (
              <div key={group.id}>
                <GroupHeader
                  group={group}
                  isExpanded={expandedGroups.has(group.id)}
                  onToggle={toggleGroup}
                  onDelete={handleDeleteGroup}
                  isDeleteOpen={isDeleteGroupOpen}
                  selectedGroupId={selectedGroupId}
                  setIsDeleteOpen={setIsDeleteGroupOpen}
                  setSelectedGroupId={setSelectedGroupId}
                  deleteOption={deleteOption}
                  setDeleteOption={setDeleteOption}
                  codeCount={groupedCodes.get(group.id)?.length || 0}
                />
                {expandedGroups.has(group.id) && (
                  <div className="pl-6">
                    <SortableContext
                      items={(groupedCodes.get(group.id) || []).map(
                        (code) => code.id
                      )}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-1">
                        {groupedCodes.get(group.id)?.length === 0 && (
                          <div className="text-center text-sm text-muted-foreground">
                            No codes in {group.name}
                          </div>
                        )}
                        {(groupedCodes.get(group.id) || []).map((code) => (
                          <SortableCode
                            key={code.id}
                            code={code}
                            onDelete={deleteCode}
                            isOpen={open}
                            onToggle={toggleCode}
                            isExpanded={expandedCodes.has(code.id)}
                            selections={getCodeSelections(code.id)}
                            scrollToCodeSelection={scrollToCodeSelection}
                            setOpen={setOpen}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DndContext>
      </SheetContent>
    </Sheet>
  );
}
