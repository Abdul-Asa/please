// "use client";
// import { SoftShadows, Sky, CameraControls } from "@react-three/drei";
// import {
//   XR,
//   createXRStore,
//   IfInSessionMode,
//   useXR,
//   XROrigin,
//   noEvents,
//   PointerEvents,
// } from "@react-three/xr";
// import { Canvas } from "@react-three/fiber";

// import { useTheme } from "next-themes";
// import { useCanvas } from "../../useCanvas";
// import { Model as Room, Light, Sphere } from "./room";
// import type { Node } from "../../types";
// import NodePanel from "./panel";

// const xrStore = createXRStore({
//   foveation: 0,
//   emulate: { syntheticEnvironment: false },
// });

// function NonAREnvironment() {
//   const inAR = useXR((s) => s.mode === "immersive-ar");
//   const { theme } = useTheme();
//   if (inAR) return null;
//   else
//     return (
//       <>
//         <SoftShadows />
//         <IfInSessionMode deny={["immersive-vr", "immersive-ar"]}>
//           <CameraControls makeDefault />
//         </IfInSessionMode>
//         <color attach="background" args={["#d0d0d0"]} />
//         <fog attach="fog" args={["#d0d0d0", 8, 35]} />
//         <ambientLight intensity={theme === "light" ? 0.1 : 0.4} />
//         <Light />
//         <Room scale={0.5} position={[0, -1, 0]} />
//         <Sphere />
//         <Sphere position={[2, 4, -8]} scale={0.9} />
//         <Sphere position={[-2, 2, -8]} scale={0.8} />
//         <Sky inclination={0.52} />
//       </>
//     );
// }

// export default function VRCanvas() {
//   const { controls, canvas } = useCanvas();
//   const { updateViewport } = controls;
//   const { nodes } = canvas;

//   const calculateArcPositions = (nodes: Node[]) => {
//     const maxWidth = 3;
//     const radius = 1; // Distance from user
//     const angleStep = Math.PI / 4; // 45 degrees between nodes
//     const startAngle = -Math.PI / 4; // Start at -45 degrees

//     return nodes.map((node, index) => {
//       const row = Math.floor(index / maxWidth);
//       const col = index % maxWidth;
//       const angle = startAngle + col * angleStep;
//       const x = Math.sin(angle) * radius;
//       const z = -Math.cos(angle) * radius - 0.6; // -0.6 to match original z position
//       const y = row * 0.4 + 0.2; // 0.2 to match original y position
//       return [x, y, z] as [number, number, number];
//     });
//   };

//   const positions = calculateArcPositions(nodes);

//   return (
//     <>
//       <Canvas
//         shadows
//         // camera={{ position: [5, 2, 10], fov: 50 }}
//         style={{
//           position: "fixed",
//           width: "100%",
//           height: "100%",
//           flexGrow: 1,
//         }}
//         gl={{ localClippingEnabled: true }}
//         events={noEvents}
//       >
//         <PointerEvents batchEvents={false} />
//         {/* <OrbitHandles /> */}
//         <XR store={xrStore}>
//           <NonAREnvironment />
//           <XROrigin position={[0, 0, 0]} />
//           {nodes.map((node, index) => (
//             <NodePanel key={node.id} node={node} position={positions[index]} />
//           ))}
//         </XR>
//       </Canvas>
//       <div
//         style={{
//           position: "fixed",
//           display: "flex",
//           width: "100vw",
//           height: "100vh",
//           flexDirection: "column",
//           justifyContent: "space-between",
//           alignItems: "center",
//           color: "white",
//           pointerEvents: "none",
//         }}
//       >
//         <button
//           onClick={async () => {
//             await xrStore.getState().session?.end();
//             updateViewport({ is3D: "AR" });
//             xrStore
//               .enterAR()
//               .then(() => {
//                 console.log("AR entered");
//               })
//               .catch((error) => {
//                 alert("Error entering AR:" + error);
//               });
//           }}
//           style={{
//             position: "fixed",
//             bottom: "20px",
//             left: "20%",
//             transform: "translateX(-50%)",
//             fontSize: "20px",
//             background: "black",
//             borderRadius: "0.5rem",
//             border: "none",
//             fontWeight: "bold",
//             color: "white",
//             padding: "1rem 2rem",
//             cursor: "pointer",
//             boxShadow: "0px 0px 20px rgba(0,0,0,1)",
//             pointerEvents: "auto",
//           }}
//         >
//           Enter AR
//         </button>
//         <button
//           onClick={async () => {
//             await xrStore.getState().session?.end();
//             updateViewport({ is3D: "VR" });
//             xrStore
//               .enterVR()
//               .then(() => {
//                 console.log("VR entered");
//               })
//               .catch((error) => {
//                 alert("Error entering VR:" + error);
//               });
//           }}
//           style={{
//             position: "fixed",
//             bottom: "20px",
//             left: "50%",
//             transform: "translateX(-50%)",
//             fontSize: "20px",
//             background: "black",
//             borderRadius: "0.5rem",
//             border: "none",
//             fontWeight: "bold",
//             color: "white",
//             padding: "1rem 2rem",
//             cursor: "pointer",
//             boxShadow: "0px 0px 20px rgba(0,0,0,1)",
//             pointerEvents: "auto",
//           }}
//         >
//           Enter VR
//         </button>
//         <button
//           onClick={() => {
//             updateViewport({ is3D: null });
//             xrStore.getState().session?.end();
//           }}
//           style={{
//             position: "fixed",
//             bottom: "20px",
//             left: "80%",
//             transform: "translateX(-50%)",
//             fontSize: "20px",
//             background: "black",
//             borderRadius: "0.5rem",
//             border: "none",
//             fontWeight: "bold",
//             color: "white",
//             padding: "1rem 2rem",
//             cursor: "pointer",
//             boxShadow: "0px 0px 20px rgba(0,0,0,1)",
//             pointerEvents: "auto",
//           }}
//         >
//           Exit 3D
//         </button>
//       </div>
//     </>
//   );
// }

// "use client";
// import { useFrame } from "@react-three/fiber";
// import {
//   Container,
//   Text,
//   Root,
//   ComponentInternals,
//   DefaultProperties,
//   MetalMaterial,
//   setPreferredColorScheme,
//   PreferredColorScheme,
// } from "@react-three/uikit";
// import { Button, colors, Defaults } from "@react-three/uikit-default";
// import { ExpandIcon } from "@react-three/uikit-lucide";
// import { forwardRef, RefObject, useMemo, useRef } from "react";
// import { Handle, HandleStore, HandleTarget } from "@react-three/handle";
// import {
//   Euler,
//   Group,
//   MeshPhongMaterial,
//   Object3D,
//   Quaternion,
//   Vector3,
// } from "three";
// import { clamp, damp } from "three/src/math/MathUtils.js";
// import { Signal } from "@preact/signals";
// import { Node } from "../../types";
// import { useTheme } from "next-themes";

// class GlassMaterial extends MeshPhongMaterial {
//   constructor() {
//     super({
//       specular: 0x111111,
//       shininess: 100,
//     });
//   }
// }

// const eulerHelper = new Euler();
// const quaternionHelper = new Quaternion();
// const vectorHelper1 = new Vector3();
// const vectorHelper2 = new Vector3();
// const zAxis = new Vector3(0, 0, 1);

// export default function NodePanel({
//   position = [0, 0, 0],
//   node,
// }: {
//   position?: [number, number, number];
//   node: Node;
// }) {
//   const { theme } = useTheme();
//   setPreferredColorScheme(theme as PreferredColorScheme);

//   const ref = useRef<Group>(null);
//   const storeRef = useRef<HandleStore<any>>(null);
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
//   const height = useMemo(() => new Signal(450), []);
//   const width = useMemo(() => new Signal(500), []);
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
//     <group position={position}>
//       <HandleTarget>
//         <group ref={ref} pointerEventsType={{ deny: "grab" }}>
//           <group ref={innerTarget}>
//             <DefaultProperties borderColor={colors.background}>
//               <Defaults>
//                 <Root
//                   anchorY="bottom"
//                   width={width}
//                   height={height}
//                   alignItems="center"
//                   flexDirection="column"
//                   pixelSize={0.0015}
//                 >
//                   <Handle
//                     translate="as-scale"
//                     targetRef={innerTarget}
//                     apply={(state) => {
//                       if (state.first) {
//                         intialMaxHeight.current = height.value;
//                         intialWidth.current = width.value;
//                       } else if (
//                         intialMaxHeight.current != null &&
//                         intialWidth.current != null
//                       ) {
//                         height.value = clamp(
//                           state.current.scale.y * intialMaxHeight.current,
//                           250,
//                           700
//                         );
//                         width.value = clamp(
//                           state.current.scale.x * intialWidth.current,
//                           400,
//                           800
//                         );
//                       }
//                     }}
//                     handleRef={handleRef}
//                     rotate={false}
//                     multitouch={false}
//                     scale={{ z: false }}
//                   >
//                     <Container
//                       pointerEventsType={{ deny: "touch" }}
//                       ref={containerRef}
//                       positionType="absolute"
//                       positionTop={-26}
//                       width={26}
//                       height={26}
//                       backgroundColor={colors.background}
//                       borderRadius={100}
//                       positionRight={-26}
//                       panelMaterialClass={GlassMaterial}
//                       borderBend={0.4}
//                       borderWidth={4}
//                     ></Container>
//                   </Handle>
//                   <Container
//                     alignItems="center"
//                     flexGrow={1}
//                     width="100%"
//                     flexDirection="column-reverse"
//                     gapRow={8}
//                   >
//                     <Container
//                       display="flex"
//                       alignItems="center"
//                       flexShrink={0}
//                       paddingLeft={16}
//                       paddingRight={16}
//                       paddingTop={4}
//                       paddingBottom={4}
//                       backgroundColor={colors.background}
//                       borderRadius={16}
//                       panelMaterialClass={GlassMaterial}
//                       borderBend={0.4}
//                       borderWidth={4}
//                       flexDirection="row"
//                       gapColumn={16}
//                       width="100%"
//                       zIndexOffset={10}
//                       transformTranslateZ={10}
//                       marginTop={-30}
//                       maxWidth={350}
//                     >
//                       <Text
//                         fontSize={14}
//                         fontWeight={500}
//                         lineHeight={28}
//                         color="rgb(0,0,0)"
//                         dark={{ color: "rgb(255,255,255)" }}
//                         flexDirection="column"
//                       >
//                         {node.label || node.type}
//                       </Text>
//                       <Container flexGrow={1} />
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         onClick={() => {
//                           height.value = 450;
//                           width.value = 500;
//                         }}
//                       >
//                         <ExpandIcon
//                           width={16}
//                           color="rgb(17,24,39)"
//                           dark={{ color: "rgb(243,244,246)" }}
//                         />
//                       </Button>
//                     </Container>
//                     <Container
//                       flexGrow={1}
//                       scrollbarBorderRadius={4}
//                       scrollbarOpacity={0.2}
//                       flexDirection="column"
//                       overflow="scroll"
//                       panelMaterialClass={GlassMaterial}
//                       borderBend={0.4}
//                       backgroundColor={colors.background}
//                       borderRadius={16}
//                       borderWidth={4}
//                       borderColor={colors.background}
//                       width="100%"
//                       hover={{
//                         borderColor: colors.accent,
//                       }}
//                     >
//                       <Container
//                         flexShrink={0}
//                         display="flex"
//                         flexDirection="column"
//                         gapRow={16}
//                         padding={32}
//                         width="100%"
//                       >
//                         <Text
//                           fontSize={16}
//                           lineHeight={24}
//                           color="rgb(0,0,0)"
//                           dark={{ color: "rgb(255,255,255)" }}
//                           width="100%"
//                           fontWeight={400}
//                           letterSpacing={0.5}
//                         >
//                           {node.vrText}
//                         </Text>
//                       </Container>
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
