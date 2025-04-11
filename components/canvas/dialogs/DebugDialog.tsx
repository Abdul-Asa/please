"use client";

import { Button } from "@/components/ui/button";
import { Bug, X } from "lucide-react";
import { useCanvas } from "../useCanvas";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function DebugDialog() {
  const { canvas } = useCanvas();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        tooltip="Debug"
        tooltipSide="bottom"
        className="hidden lg:flex"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bug size={18} />
      </Button>

      <AnimatePresence>
        {isOpen && canvas.viewport.expandedNodeId === "" && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="absolute top-20 right-4 w-80 max-h-[calc(100vh-6rem)] bg-background/95 border border-border rounded-lg shadow-lg overflow-hidden backdrop-blur-sm z-50"
          >
            <div className="p-4 border-b border-border flex items-center">
              <h3 className="font-semibold">Debug Panel</h3>
              <Button
                variant="outline"
                className="absolute right-4 top-4 rounded-sm size-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Viewport</h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(canvas.viewport, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Nodes</h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(canvas.nodes, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Codes</h4>
                  <pre className="text-xs bg-muted p-2 rounded">
                    {JSON.stringify(canvas.codes, null, 2)}
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Code Groups</h4>
                  <pre className="text-xs bg-muted p-2 rounded">
                    {JSON.stringify(canvas.codeGroups, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
