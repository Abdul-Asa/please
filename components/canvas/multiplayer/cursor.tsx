import { useOthers, useMyPresence } from "@liveblocks/react/suspense";
import { GrabIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useCanvas } from "../useCanvas";

const Cursor = ({
  name,
  color,
  isClient,
  cursor,
  isGrabbing,
}: {
  name?: string;
  color?: string;
  isGrabbing?: boolean;
  isClient?: boolean;
  cursor?: { x: number; y: number } | null;
}) => {
  const {
    canvas: { viewport },
  } = useCanvas();

  if (!cursor) return null;

  // Transform cursor position from canvas coordinates to screen coordinates
  const screenX = cursor.x * viewport.scale + viewport.panOffsetX;
  const screenY = cursor.y * viewport.scale + viewport.panOffsetY;

  if (isClient) {
    return (
      <motion.span
        className="absolute border-2 p-1 border-white text-white pointer-events-none"
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          backgroundColor: color,
          translateX: screenX,
          translateY: screenY,
        }}
      >
        <p className="max-w-40 truncate p-1">{name ? name : "Anonymous"}</p>
      </motion.span>
    );
  }

  return (
    <motion.div
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        transform: `translate(${screenX}px, ${screenY}px)`,
      }}
      transition={{
        type: "spring",
        damping: 30,
        mass: 0.8,
        stiffness: 350,
      }}
    >
      {isGrabbing ? (
        <GrabIcon
          style={{
            color: color,
          }}
        />
      ) : (
        <svg
          width="18"
          height="24"
          viewBox="0 0 18 24"
          fill="none"
          style={{
            color: color,
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.717 2.22918L15.9831 15.8743C16.5994 16.5083 16.1503 17.5714 15.2661 17.5714H9.35976C8.59988 17.5714 7.86831 17.8598 7.3128 18.3783L2.68232 22.7C2.0431 23.2966 1 22.8434 1 21.969V2.92626C1 2.02855 2.09122 1.58553 2.717 2.22918Z"
            fill={color}
            stroke={"white"}
            strokeWidth="1"
          />
        </svg>
      )}
      <div
        style={{
          backgroundColor: color,
        }}
        className="absolute border-2 p-1 border-white text-white pointer-events-none translate-x-4"
      >
        <p className="max-w-40 truncate p-1">{name ? name : "Guest"}</p>
      </div>
    </motion.div>
  );
};

export function MultiplayerCursors() {
  const [, updateMyPresence] = useMyPresence();
  const others = useOthers();
  const {
    canvas: { viewport },
  } = useCanvas();

  useEffect(() => {
    updateMyPresence({
      isGrabbing: viewport.isDragging,
    });
  }, [viewport.isDragging, updateMyPresence]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const canvasRect = document
        .getElementById("canvas")
        ?.getBoundingClientRect();
      if (!canvasRect) return;

      // Convert screen coordinates to canvas coordinates (same as node coordinates)
      const x =
        (e.clientX - canvasRect.left - viewport.panOffsetX) / viewport.scale;
      const y =
        (e.clientY - canvasRect.top - viewport.panOffsetY) / viewport.scale;

      updateMyPresence({
        cursor: { x, y },
      });
    };

    document.addEventListener("pointermove", handlePointerMove);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
    };
  }, [
    updateMyPresence,
    viewport.scale,
    viewport.panOffsetX,
    viewport.panOffsetY,
  ]);

  return (
    <>
      {others.map((other) => (
        <Cursor key={other.id} {...other.presence} />
      ))}
      {/* <Cursor {...myPresence} isClient /> */}
    </>
  );
}
