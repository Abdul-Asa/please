"use client";
import {
  Environment,
  OrbitControls,
  SoftShadows,
  Sky,
  CameraControls,
} from "@react-three/drei";
import {
  XR,
  createXRStore,
  IfInSessionMode,
  useXR,
  XROrigin,
} from "@react-three/xr";
import { Canvas } from "@react-three/fiber";
import { useCanvas } from "../useCanvas";
import { Model as Room, Light, Sphere } from "./assets/room";

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

  const endSession = () => {
    xrStore.getState().session?.end();
  };

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [5, 2, 10], fov: 50 }}
        style={{
          position: "fixed",
          width: "100vw",
          height: "100vh",
        }}
      >
        <XR store={xrStore}>
          <NonAREnvironment />
          {/* <XROrigin position-y={-1.5} position-z={0.5} /> */}
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
          onClick={() => {
            endSession();
            updateViewport({ is3D: "AR" });
            xrStore.enterAR();
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
          onClick={() => {
            endSession();
            updateViewport({ is3D: "VR" });
            xrStore.enterVR();
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
            endSession();
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

// import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import {
//   createXRStore,
//   noEvents,
//   PointerEvents,
//   useXR,
//   XR,
//   XROrigin,
//   isAppleVisionPro,
// } from "@react-three/xr";
// import { Environment } from "@react-three/drei";
// import {
//   Container,
//   Text,
//   Image,
//   Root,
//   setPreferredColorScheme,
//   ComponentInternals,
//   DefaultProperties,
//   MetalMaterial,
// } from "@react-three/uikit";
// import { Button, colors, Defaults, Slider } from "@react-three/uikit-default";
// import {
//   ArrowLeftIcon,
//   ArrowRightIcon,
//   BackpackIcon,
//   ConstructionIcon,
//   ExpandIcon,
//   HeartIcon,
//   ListIcon,
//   MenuIcon,
//   PlayIcon,
// } from "@react-three/uikit-lucide";
// import {
//   forwardRef,
//   RefObject,
//   useMemo,
//   useRef,
//   useState,
//   useCallback,
// } from "react";
// import {
//   Handle,
//   HandleStore,
//   HandleTarget,
//   OrbitHandles,
//   useHandle,
// } from "@react-three/handle";
// import {
//   Euler,
//   Group,
//   MeshPhysicalMaterial,
//   Object3D,
//   Quaternion,
//   StaticReadUsage,
//   Vector3,
// } from "three";
// import { clamp, damp } from "three/src/math/MathUtils.js";

// export class GlassMaterial extends MeshPhysicalMaterial {
//   constructor() {
//     super({
//       transmission: 0.5,
//       roughness: 0.3,
//       reflectivity: 0.5,
//       iridescence: 0.4,
//       thickness: 0.05,
//       specularIntensity: 1,
//       metalness: 0.3,
//       ior: 2,
//       envMapIntensity: 1,
//     });
//   }
// }

// const store = createXRStore();

// setPreferredColorScheme("dark");

// export function ThreeDCanvas() {
//   return (
//     <>
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           gap: "1rem",
//           position: "absolute",
//           zIndex: 10000,
//           bottom: "1rem",
//           left: "50%",
//           transform: "translate(-50%, 0)",
//         }}
//       >
//         <button
//           style={{
//             background: "white",
//             borderRadius: "0.5rem",
//             border: "none",
//             fontWeight: "bold",
//             color: "black",
//             padding: "1rem 2rem",
//             cursor: "pointer",
//             fontSize: "1.5rem",
//             boxShadow: "0px 0px 20px rgba(0,0,0,1)",
//           }}
//           onClick={() => store.enterAR()}
//         >
//           Enter AR
//         </button>
//         <button
//           style={{
//             background: "white",
//             borderRadius: "0.5rem",
//             border: "none",
//             fontWeight: "bold",
//             color: "black",
//             padding: "1rem 2rem",
//             cursor: "pointer",
//             fontSize: "1.5rem",
//             boxShadow: "0px 0px 20px rgba(0,0,0,1)",
//           }}
//           onClick={() => store.enterVR()}
//         >
//           Enter VR
//         </button>
//       </div>
//       <Canvas
//         events={noEvents}
//         gl={{ localClippingEnabled: true }}
//         style={{ width: "100%", flexGrow: 1 }}
//         camera={{ position: [0, 0, 0.65] }}
//       >
//         <PointerEvents batchEvents={false} />
//         <OrbitHandles />
//         <XR store={store}>
//           <NonAREnvironment />
//           <XROrigin position-y={-1.5} position-z={0.5} />
//           <CardItem />
//           <CardItem />
//         </XR>
//       </Canvas>
//     </>
//   );
// }
// function NonAREnvironment() {
//   const inAR = useXR((s) => s.mode === "immersive-ar");
//   return (
//     <Environment
//       blur={0.1}
//       background={!inAR}
//       environmentIntensity={2}
//       preset="sunset"
//     />
//   );
// }

// const eulerHelper = new Euler();
// const quaternionHelper = new Quaternion();
// const vectorHelper1 = new Vector3();
// const vectorHelper2 = new Vector3();
// const zAxis = new Vector3(0, 0, 1);

// function CardItem() {
//   const ref = useRef<Group>(null);
//   const storeRef = useRef<HandleStore<any>>(null);

//   const [dimensions, setDimensions] = useState({
//     height: 450,
//     width: 700,
//     menuWidth: 200,
//   });

//   const showSidePanel = useMemo(
//     () => dimensions.width > 500,
//     [dimensions.width]
//   );

//   const sidePanelDisplay = useMemo(
//     () => (showSidePanel ? "flex" : "none"),
//     [showSidePanel]
//   );

//   const borderLeftRadius = useMemo(
//     () => (showSidePanel ? 0 : 16),
//     [showSidePanel]
//   );

//   const paddingLeft = useMemo(() => (showSidePanel ? 20 : 0), [showSidePanel]);

//   const handleDimensionChange = useCallback(
//     (newDimensions: Partial<typeof dimensions>) => {
//       setDimensions((prev) => ({
//         ...prev,
//         ...newDimensions,
//       }));
//     },
//     []
//   );

//   useFrame((state, dt) => {
//     if (ref.current == null || storeRef.current?.getState() == null) {
//       return;
//     }
//     state.camera.getWorldPosition(vectorHelper1);
//     ref.current.getWorldPosition(vectorHelper2);
//     quaternionHelper.setFromUnitVectors(
//       zAxis,
//       vectorHelper1.sub(vectorHelper2).normalize()
//     );
//     eulerHelper.setFromQuaternion(quaternionHelper, "YXZ");
//     ref.current.rotation.y = damp(
//       ref.current.rotation.y,
//       eulerHelper.y,
//       10,
//       dt
//     );
//   });
//   const intialMaxHeight = useRef<number>(undefined);
//   const intialWidth = useRef<number>(undefined);
//   const containerRef = useRef<ComponentInternals>(null);
//   const handleRef = useMemo(
//     () =>
//       new Proxy<RefObject<Object3D | null>>(
//         { current: null },
//         { get: () => containerRef.current?.interactionPanel }
//       ),
//     []
//   );
//   const innerTarget = useRef<Group>(null);
//   return (
//     <group position-y={-0.3}>
//       <HandleTarget>
//         <group ref={ref} pointerEventsType={{ deny: "grab" }}>
//           <group ref={innerTarget}>
//             <DefaultProperties borderColor={colors.background}>
//               <Defaults>
//                 <Root
//                   anchorY="bottom"
//                   width={dimensions.width}
//                   height={dimensions.height}
//                   alignItems="center"
//                   flexDirection="column"
//                   pixelSize={0.0015}
//                 >
//                   <Container
//                     alignItems="center"
//                     flexGrow={1}
//                     width="100%"
//                     flexDirection="column-reverse"
//                     gapRow={8}
//                   >
//                     <Container width="100%" flexDirection="row" flexGrow={1}>
//                       <SimpleContainer />
//                     </Container>
//                   </Container>
//                   <BarHandle ref={storeRef} />
//                 </Root>
//               </Defaults>
//             </DefaultProperties>
//           </group>
//         </group>
//       </HandleTarget>
//     </group>
//   );
// }

// const BarHandle = forwardRef<HandleStore<any>, {}>((props, ref) => {
//   const containerRef = useRef<ComponentInternals>(null);
//   const handleRef = useMemo(
//     () =>
//       new Proxy<RefObject<Object3D | null>>(
//         { current: null },
//         { get: () => containerRef.current?.interactionPanel }
//       ),
//     []
//   );
//   return (
//     <Handle
//       ref={ref}
//       handleRef={handleRef}
//       targetRef="from-context"
//       scale={false}
//       multitouch={false}
//       rotate={false}
//     >
//       <Container
//         panelMaterialClass={GlassMaterial}
//         borderBend={0.4}
//         borderWidth={4}
//         pointerEventsType={{ deny: "touch" }}
//         marginTop={10}
//         hover={{
//           maxWidth: 240,
//           width: "100%",
//           backgroundColor: colors.accent,
//           marginX: 10,
//           marginTop: 6,
//           height: 18,
//           transformTranslateY: 2,
//         }}
//         cursor="pointer"
//         ref={containerRef}
//         width="90%"
//         maxWidth={200}
//         height={14}
//         borderRadius={10}
//         backgroundColor={colors.background}
//         marginX={20}
//       ></Container>
//     </Handle>
//   );
// });
// function SimpleContainer() {
//   return (
//     <Container
//       backgroundColor={colors.background}
//       borderRadius={16}
//       panelMaterialClass={GlassMaterial}
//       padding={20}
//     >
//       <Text color="white" fontSize={16}>
//         Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
//         tempor incididunt ut labore et dolore magna aliqua.
//       </Text>
//     </Container>
//   );
// }
