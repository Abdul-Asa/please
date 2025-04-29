"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { Loader2 } from "lucide-react";
import { PREDEFINED_COLORS } from "../constants";
import { first } from "random-name";
import { useAtomValue } from "jotai";
import { nodesAtom, codesAtom, codeGroupsAtom, viewportAtom } from "../store";
import { LiveList, LiveObject, LiveMap } from "@liveblocks/client";
import {
  LiveNode,
  LiveCode,
  LiveCodeGroup,
  LiveViewport,
  LiveFileContent,
} from "../types";

export function Room({ children, id }: { children: ReactNode; id: string }) {
  const randomColor =
    PREDEFINED_COLORS[Math.floor(Math.random() * PREDEFINED_COLORS.length)];
  const randomName = first();
  const nodes = useAtomValue(nodesAtom);
  const codes = useAtomValue(codesAtom);
  const codeGroups = useAtomValue(codeGroupsAtom);
  const viewport = useAtomValue(viewportAtom);

  const initialStorage = {
    nodes: new LiveList(nodes as LiveNode[]),
    codes: new LiveList(codes as LiveCode[]),
    codeGroups: new LiveList(codeGroups as LiveCodeGroup[]),
    viewport: new LiveObject(viewport as LiveViewport),
    fileContents: new LiveMap<string, LiveFileContent>(),
  };

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
        }}
        initialStorage={initialStorage}
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
