"use client";
import {
  SoftShadows,
  Sky,
  CameraControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import {
  XR,
  createXRStore,
  useXR,
  XROrigin,
  noEvents,
  PointerEvents,
  IfInSessionMode,
} from "@react-three/xr";
import { Canvas } from "@react-three/fiber";
import { useCanvas } from "../useCanvas";
import { Model as Room, Light, Sphere } from "./assets/room";
import { useTheme } from "next-themes";
import { Node } from "../types";
import NodePanel, { Toolbar, CodeListPanel } from "./assets/panel";

export const xrStore = createXRStore({
  foveation: 0,
  emulate: { syntheticEnvironment: false },
});

function NonAREnvironment({ environment }: { environment: "room" | "space" }) {
  const inAR = useXR((s) => s.mode === "immersive-ar");
  if (inAR) return null;
  else
    return (
      <>
        <IfInSessionMode deny={["immersive-vr", "immersive-ar"]}>
          <CameraControls makeDefault />
        </IfInSessionMode>
        {environment === "room" ? <Env1 /> : <Env2 inAR={inAR} />}
      </>
    );
}

function Env1() {
  const { theme } = useTheme();
  return (
    <>
      <SoftShadows />
      <color attach="background" args={["#d0d0d0"]} />
      <fog attach="fog" args={["#d0d0d0", 8, 35]} />
      <ambientLight intensity={theme === "dark" ? 0.1 : 0.4} />
      <Light />
      <Room scale={0.5} position={[0, -1.5, 0]} />
      <Sphere />
      <Sphere position={[2, 4, -8]} scale={0.9} />
      <Sphere position={[-2, 2, -8]} scale={0.8} />
      <Sky inclination={0.52} />
    </>
  );
}

function Env2({ inAR }: { inAR: boolean }) {
  return (
    <>
      {/* <hemisphereLight groundColor="red" /> */}
      <Environment
        blur={0.1}
        background={!inAR}
        environmentIntensity={2}
        preset="sunset"
      />
      {/* <ContactShadows position={[0, -9, 0]} opacity={0.7} scale={40} blur={1} /> */}
    </>
  );
}

export default function VRCanvas() {
  const { controls, canvas } = useCanvas();
  const { updateViewport } = controls;
  const { nodes, viewport } = canvas;

  const calculateArcPositions = (nodes: Node[]) => {
    const maxWidth = 3;
    const radius = 1; // Distance from user
    const angleStep = Math.PI / 4; // 45 degrees between nodes
    const startAngle = -Math.PI / 4; // Start at -45 degrees

    return nodes.map((node, index) => {
      const row = Math.floor(index / maxWidth);
      const col = index % maxWidth;
      const angle = startAngle + col * angleStep;
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius - 0.6; // -0.6 to match original z position
      const y = row * 0.4 + 0.2; // 0.2 to match original y position
      return [x, y, z] as [number, number, number];
    });
  };

  const positions = calculateArcPositions(nodes);
  return (
    <>
      <Canvas
        events={noEvents}
        gl={{ localClippingEnabled: true }}
        style={{ width: "100dvw", height: "100dvh", flexGrow: 1 }}
        camera={{ position: [0, 0, 0.65] }}
      >
        <PointerEvents batchEvents={false} />
        {/* <OrbitHandles /> */}
        <XR store={xrStore}>
          <NonAREnvironment environment={viewport.vrEnvironment} />
          <XROrigin position-y={-0.5} position-z={0.5} />
          {nodes.map((node, index) => (
            <NodePanel key={node.id} node={node} position={positions[index]} />
          ))}
          <Toolbar position={[0, 0, -0.6]} />
          <CodeListPanel position={[0.8, 0, -0.6]} />
        </XR>
      </Canvas>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          position: "absolute",
          zIndex: 10000,
          bottom: "1rem",
          left: "50%",
          transform: "translate(-50%, 0)",
        }}
      >
        <button
          style={{
            background: "white",
            borderRadius: "0.5rem",
            border: "none",
            fontWeight: "bold",
            color: "black",
            padding: "1rem 2rem",
            cursor: "pointer",
            fontSize: "1.5rem",
            boxShadow: "0px 0px 20px rgba(0,0,0,1)",
          }}
          onClick={async () => {
            await xrStore.getState().session?.end();
            updateViewport({ is3D: "AR" });
            xrStore
              .enterAR()
              .then(() => {
                console.log("AR entered");
              })
              .catch((error) => {
                alert("Error entering AR:" + error);
              });
          }}
        >
          Enter AR
        </button>
        <button
          style={{
            background: "white",
            borderRadius: "0.5rem",
            border: "none",
            fontWeight: "bold",
            color: "black",
            padding: "1rem 2rem",
            cursor: "pointer",
            fontSize: "1.5rem",
            boxShadow: "0px 0px 20px rgba(0,0,0,1)",
          }}
          onClick={async () => {
            await xrStore.getState().session?.end();
            updateViewport({ is3D: "VR" });
            xrStore
              .enterVR()
              .then(() => {
                console.log("VR entered");
              })
              .catch((error) => {
                alert("Error entering VR:" + error);
              });
          }}
        >
          Enter VR
        </button>
        <button
          style={{
            background: "white",
            borderRadius: "0.5rem",
            border: "none",
            fontWeight: "bold",
            color: "black",
            padding: "1rem 2rem",
            cursor: "pointer",
            fontSize: "1.5rem",
            boxShadow: "0px 0px 20px rgba(0,0,0,1)",
          }}
          onClick={() => {
            updateViewport({ is3D: null });
            xrStore.getState().session?.end();
          }}
        >
          Exit
        </button>
      </div>
    </>
  );
}
