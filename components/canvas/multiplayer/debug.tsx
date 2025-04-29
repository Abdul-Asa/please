import { useStorage } from "@liveblocks/react/suspense";

export function MultiplayerDebug() {
  const nodes = useStorage((root) => root.nodes);
  const codes = useStorage((root) => root.codes);
  const codeGroups = useStorage((root) => root.codeGroups);

  return (
    <>
      <div>
        <h4 className="text-sm font-medium mb-2">Nodes</h4>
        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto select-text">
          {JSON.stringify(nodes, null, 2)}
        </pre>
      </div>
      <div>
        <h4 className="text-sm font-medium mb-2">Codes</h4>
        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto select-text">
          {JSON.stringify(codes, null, 2)}
        </pre>
      </div>
      <div>
        <h4 className="text-sm font-medium mb-2">Code Groups</h4>
        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto select-text">
          {JSON.stringify(codeGroups, null, 2)}
        </pre>
      </div>
    </>
  );
}
