"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Item {
  id: string;
  content: string;
}

interface Container {
  id: string;
  title: string;
  items: Item[];
}

function SortableItem({ id, content }: Item) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between rounded border p-2 mb-2 bg-white"
      {...attributes}
      {...listeners}
    >
      <span>{content}</span>
      <div className="cursor-grab">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </div>
    </div>
  );
}

export function SortableContainers() {
  const [containers, setContainers] = React.useState<Container[]>([
    {
      id: "container-1",
      title: "Container 1",
      items: [
        { id: "item-1", content: "Item 1" },
        { id: "item-2", content: "Item 2" },
      ],
    },
    {
      id: "container-2",
      title: "Container 2",
      items: [
        { id: "item-3", content: "Item 3" },
        { id: "item-4", content: "Item 4" },
      ],
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const findContainer = (id: string) => {
    return containers.find((container) =>
      container.items.some((item) => item.id === id)
    );
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer || !overContainer) return;

    if (activeContainer.id !== overContainer.id) {
      setContainers((prev) => {
        const activeItems = [...activeContainer.items];
        const overItems = [...overContainer.items];
        const activeIndex = activeItems.findIndex(
          (item) => item.id === active.id
        );
        const overIndex = overItems.findIndex((item) => item.id === over.id);

        if (activeIndex !== -1) {
          const [removed] = activeItems.splice(activeIndex, 1);
          overItems.splice(overIndex, 0, removed);
        }

        return prev.map((container) => {
          if (container.id === activeContainer.id) {
            return { ...container, items: activeItems };
          }
          if (container.id === overContainer.id) {
            return { ...container, items: overItems };
          }
          return container;
        });
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    if (!activeContainer) return;

    const activeIndex = activeContainer.items.findIndex(
      (item) => item.id === active.id
    );
    const overIndex = activeContainer.items.findIndex(
      (item) => item.id === over.id
    );

    if (activeIndex !== overIndex) {
      setContainers((prev) =>
        prev.map((container) => {
          if (container.id === activeContainer.id) {
            return {
              ...container,
              items: arrayMove(container.items, activeIndex, overIndex),
            };
          }
          return container;
        })
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-4">
        {containers.map((container) => (
          <div
            key={container.id}
            className="w-full rounded-lg border p-4 bg-gray-50"
          >
            <h3 className="mb-4 font-semibold">{container.title}</h3>
            <SortableContext
              items={container.items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {container.items.map((item) => (
                  <SortableItem key={item.id} {...item} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
