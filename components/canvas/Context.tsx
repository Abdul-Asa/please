import { createContext } from "react";
import { ReactNode } from "react";
import { CanvasData } from "./types";

interface CanvasContextType {
  initialData?: CanvasData;
}

export const CanvasContext = createContext<CanvasContextType | null>(null);
export function CanvasProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: CanvasData;
}) {
  return (
    <CanvasContext.Provider value={{ initialData }}>
      {children}
    </CanvasContext.Provider>
  );
}
