"use client";
import { SoftShadows, Sky, CameraControls } from "@react-three/drei";
import {
  XR,
  createXRStore,
  IfInSessionMode,
  useXR,
  XROrigin,
  noEvents,
  PointerEvents,
} from "@react-three/xr";
import { OrbitHandles } from "@react-three/handle";
import { Canvas } from "@react-three/fiber";
import { useCanvas } from "../useCanvas";
import { Model as Room, Light, Sphere } from "./assets/room";
import { NodePanel } from "./assets/panel";

const xrStore = createXRStore({
  foveation: 0,
  emulate: { syntheticEnvironment: false },
});

function NonAREnvironment() {
  const inAR = useXR((s) => s.mode === "immersive-ar");
  if (inAR) return null;
  return (
    <>
      <SoftShadows />
      <IfInSessionMode deny={["immersive-vr", "immersive-ar"]}>
        <CameraControls makeDefault />
      </IfInSessionMode>
      <color attach="background" args={["#d0d0d0"]} />
      <fog attach="fog" args={["#d0d0d0", 8, 35]} />
      <ambientLight intensity={0.4} />
      <Light />
      <Room scale={0.5} position={[0, -1, 0]} />
      <Sphere />
      <Sphere position={[2, 4, -8]} scale={0.9} />
      <Sphere position={[-2, 2, -8]} scale={0.8} />
      <Sky inclination={0.52} />
    </>
  );
}

export default function VRCanvas() {
  const { controls } = useCanvas();
  const { updateViewport } = controls;

  return (
    <>
      <Canvas
        shadows
        // camera={{ position: [5, 2, 10], fov: 50 }}
        style={{
          position: "fixed",
          width: "100%",
          height: "100%",
          flexGrow: 1,
        }}
        gl={{ localClippingEnabled: true }}
      >
        <PointerEvents batchEvents={false} />
        {/* <OrbitHandles /> */}
        <XR store={xrStore}>
          <NonAREnvironment />
          <XROrigin position={[0, 0, 0]} />
          <NodePanel position={[0, 0.2, -0.6]} />
        </XR>
      </Canvas>
      <div
        style={{
          position: "fixed",
          display: "flex",
          width: "100vw",
          height: "100vh",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
          pointerEvents: "none",
        }}
      >
        <button
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
          style={{
            position: "fixed",
            bottom: "20px",
            left: "20%",
            transform: "translateX(-50%)",
            fontSize: "20px",
            background: "black",
            borderRadius: "0.5rem",
            border: "none",
            fontWeight: "bold",
            color: "white",
            padding: "1rem 2rem",
            cursor: "pointer",
            boxShadow: "0px 0px 20px rgba(0,0,0,1)",
            pointerEvents: "auto",
          }}
        >
          Enter AR
        </button>
        <button
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
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "20px",
            background: "black",
            borderRadius: "0.5rem",
            border: "none",
            fontWeight: "bold",
            color: "white",
            padding: "1rem 2rem",
            cursor: "pointer",
            boxShadow: "0px 0px 20px rgba(0,0,0,1)",
            pointerEvents: "auto",
          }}
        >
          Enter VR
        </button>
        <button
          onClick={() => {
            updateViewport({ is3D: null });
            xrStore.getState().session?.end();
          }}
          style={{
            position: "fixed",
            bottom: "20px",
            left: "80%",
            transform: "translateX(-50%)",
            fontSize: "20px",
            background: "black",
            borderRadius: "0.5rem",
            border: "none",
            fontWeight: "bold",
            color: "white",
            padding: "1rem 2rem",
            cursor: "pointer",
            boxShadow: "0px 0px 20px rgba(0,0,0,1)",
            pointerEvents: "auto",
          }}
        >
          Exit 3D
        </button>
      </div>
    </>
  );
}
