"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { Loader2 } from "lucide-react";
import { PREDEFINED_COLORS } from "../constants";
import { useAtomValue } from "jotai";
import { nodesAtom, codesAtom, codeGroupsAtom, viewportAtom } from "../store";
import { LiveNode, LiveCode, LiveCodeGroup } from "../types";
import { LiveList } from "@liveblocks/client";
import { uniqueNamesGenerator } from "unique-names-generator";
import { animals } from "unique-names-generator";
export function Room({ children, id }: { children: ReactNode; id: string }) {
  const randomColor =
    PREDEFINED_COLORS[Math.floor(Math.random() * PREDEFINED_COLORS.length)];
  const randomName = uniqueNamesGenerator({
    dictionaries: [animals],
    style: "capital",
  });
  const nodes = useAtomValue(nodesAtom);
  const codes = useAtomValue(codesAtom);
  const codeGroups = useAtomValue(codeGroupsAtom);

  return (
    <LiveblocksProvider
      publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY!}
    >
      <RoomProvider
        id={id}
        initialPresence={{
          cursor: null,
          color: randomColor,
          name: randomName,
          isGrabbing: false,
          nodeBeingDragged: "",
        }}
        initialStorage={{
          nodes: new LiveList(nodes as LiveNode[]),
          codes: new LiveList(codes as LiveCode[]),
          codeGroups: new LiveList(codeGroups as LiveCodeGroup[]),
        }}
      >
        <ClientSideSuspense
          fallback={
            <div className="h-dvh w-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
