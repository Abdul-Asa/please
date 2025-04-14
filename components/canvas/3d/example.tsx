"use client";

// import { useRef, useState } from "react";
// import { Canvas } from "@react-three/fiber";
// import { VRButton, XR, Controllers, Hands } from "@react-three/xr";
// import { Environment } from "@react-three/drei";
// import { Node3D } from "./Node3D";

const initialNodes = [
  {
    id: "1",
    type: "text",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    x: -1,
    y: 1.5,
    z: -2,
    width: 1,
    height: 0.5,
    rotation: [0, 0, 0],
  },
  {
    id: "2",
    type: "text",
    text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    x: 1,
    y: 1.5,
    z: -2,
    width: 1,
    height: 0.5,
    rotation: [0, 0, 0],
  },
];

export function Canvas3D() {
  return (
    <>
      {/* <VRButton />
      <Canvas>
        <XR>
          <Controllers />
          <Hands />
          <Environment preset="sunset" />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          {initialNodes.map((node) => (
            <Node3D key={node.id} {...node} />
          ))}
        </XR>
      </Canvas> */}
    </>
  );
}
