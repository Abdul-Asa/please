"use client";

import { useMyPresence, useOthers, useSelf } from "@liveblocks/react/suspense";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCanvas } from "../useCanvas";
export function UsersList() {
  const router = useRouter();
  const others = useOthers();
  const [presence, setPresence] = useMyPresence();

  const handleNameChange = (e: React.FocusEvent<HTMLSpanElement>) => {
    const newName = e.currentTarget.textContent?.trim();
    if (!newName) {
      // Reset to original label if empty
      e.currentTarget.textContent = presence.name || "Anonymous";
      return;
    }
    if (newName !== presence.name) {
      setPresence({ name: newName });
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (newColor !== presence.color) {
      setPresence({ color: newColor });
    }
  };

  const exitRoom = () => {
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Users size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        <DropdownMenuLabel>
          <div className="flex items-center justify-between">
            Room Users
            <Badge variant="outline">{others.length + 1} users</Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Current user */}
        <div className="flex items-center gap-2 p-2">
          <input
            type="color"
            className="w-4 h-4 rounded-full border-0 p-0 appearance-none cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-moz-color-swatch]:rounded-full"
            value={presence.color}
            onChange={handleColorChange}
          />
          <span
            className="text-sm font-medium"
            contentEditable
            suppressContentEditableWarning
            onBlur={handleNameChange}
          >
            {presence.name || "Anonymous"}
          </span>
        </div>

        {others.length > 0 && <DropdownMenuSeparator />}

        {/* Other users */}
        {others.map((user) => (
          <div key={user.connectionId} className="flex items-center gap-2 p-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: user.presence.color }}
            ></div>
            <span className="text-sm font-medium cursor-default">
              {user.presence.name || "Anonymous"}
            </span>
          </div>
        ))}

        <DropdownMenuSeparator />
        <Button className="w-full" variant="destructive" onClick={exitRoom}>
          Exit Room
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
