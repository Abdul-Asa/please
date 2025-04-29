import { useOthers, useMyPresence } from "@liveblocks/react/suspense";
import { motion } from "motion/react";
import { useEffect } from "react";
const Cursor = ({
  name,
  color,
  isClient,
  cursor,
}: {
  name?: string;
  color?: string;
  isClient?: boolean;
  cursor?: { x: number; y: number } | null;
}) => {
  if (!cursor) return null;

  if (isClient) {
    return (
      <motion.span
        className="absolute border-2 p-1 border-white text-white pointer-events-none"
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          backgroundColor: color,
          translateX: cursor.x,
          translateY: cursor.y,
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
      }}
      initial={cursor}
      animate={cursor}
      transition={{
        type: "spring",
        damping: 30,
        mass: 0.8,
        stiffness: 350,
      }}
    >
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
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers();

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const canvasRect = document
        .getElementById("canvas")
        ?.getBoundingClientRect();
      if (!canvasRect) return;

      updateMyPresence({
        cursor: {
          x: e.clientX - canvasRect.left,
          y: e.clientY - canvasRect.top,
        },
      });
    };

    document.addEventListener("pointermove", handlePointerMove);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
    };
  }, [updateMyPresence]);
  return (
    <>
      {others.map((other) => (
        <Cursor key={other.id} {...other.presence} />
      ))}
      {/* <Cursor {...myPresence} isClient /> */}
    </>
  );
}
