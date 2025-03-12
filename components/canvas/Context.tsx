import { createContext } from "react";
import { ReactNode } from "react";
import { CanvasData } from "./types";

interface CanvasContextType {
  initialData: CanvasData | null;
}

export const CanvasContext = createContext<CanvasContextType | null>(null);
export function CanvasProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: CanvasData | null;
}) {
  return (
    <CanvasContext.Provider value={{ initialData }}>
      {children}
    </CanvasContext.Provider>
  );
}
