"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCanvas } from "../useCanvas";
export function MultiplayerDialog() {
  const router = useRouter();
  const { canvas, controls } = useCanvas();

  const startRoom = () => {
    if (canvas.viewport.multiplayerRoom) {
      router.push(`/${canvas.viewport.multiplayerRoom}`);
      return;
    } else {
      const roomId = crypto.randomUUID();
      controls.updateViewport({ multiplayerRoom: roomId });
      router.push(`/${roomId}`);
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
            Collaborative Mode
            <Badge variant="outline">Beta</Badge>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <Button className="w-full" onClick={startRoom}>
          Start Multiplayer Room
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
