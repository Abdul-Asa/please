"use client";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RotateCcw, Move, Box } from "lucide-react";
import { useCanvas } from "./useCanvas";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function CanvasControls() {
  const { controls, canvas } = useCanvas();
  const { zoomIn, zoomOut, resetView, togglePanMode } = controls;
  const { panMode, scale } = canvas.viewport;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-md bg-white/90 px-2 py-1 shadow-sm">
      <button className="text-gray-600 hover:text-gray-900">-</button>
      <span className="min-w-[4rem] text-center">
        {Math.round(scale * 100)}%
      </span>
      <button className="text-gray-600 hover:text-gray-900">+</button>
    </div>
  );
}
