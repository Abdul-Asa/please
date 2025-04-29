import {
  Card,
  CardHeader,
  CardContent,
  Button,
  colors,
} from "@react-three/uikit-default";
import {
  Container,
  Text,
  Root,
  GlassMaterial,
  ComponentInternals,
  PreferredColorScheme,
  setPreferredColorScheme,
  Image,
} from "@react-three/uikit";
import {
  MaximizeIcon,
  Trash2Icon,
  TypeIcon,
  FileIcon,
  PencilIcon,
  Sun,
  Moon,
  X,
  Building2,
  Rocket,
} from "@react-three/uikit-lucide";
import { Handle, HandleStore, HandleTarget } from "@react-three/handle";
import { forwardRef, RefObject, useMemo, useRef, useState } from "react";
import { Euler, Group, Quaternion, Vector3, Object3D, MathUtils } from "three";
import { useFrame } from "@react-three/fiber";
import { Signal } from "@preact/signals";
import { useTheme } from "next-themes";
import { useCanvas } from "../../useCanvas";
import { Node } from "../../types";
import { JSONContent } from "@tiptap/react";
import { useXR } from "@react-three/xr";
import { xrStore } from "../VRcanvas";

const eulerHelper = new Euler();
const quaternionHelper = new Quaternion();
const vectorHelper1 = new Vector3();
const vectorHelper2 = new Vector3();
const zAxis = new Vector3(0, 0, 1);

export default function NodePanel({
  node,
  position,
}: {
  node: Node;
  position: [number, number, number];
}) {
  const ref = useRef<Group>(null);
  const storeRef = useRef<HandleStore<any>>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const {
    canvas: { viewport },
    controls: { deleteNode, updateViewport },
  } = useCanvas();
  setPreferredColorScheme(theme as PreferredColorScheme);

  useFrame((state, dt) => {
    if (ref.current == null || storeRef.current?.getState() == null) {
      return;
    }
    state.camera.getWorldPosition(vectorHelper1);
    ref.current.getWorldPosition(vectorHelper2);
    quaternionHelper.setFromUnitVectors(
      zAxis,
      vectorHelper1.sub(vectorHelper2).normalize()
    );
    eulerHelper.setFromQuaternion(quaternionHelper, "YXZ");
    ref.current.rotation.y = MathUtils.damp(
      ref.current.rotation.y,
      eulerHelper.y,
      10,
      dt
    );
  });

  const height = useMemo(() => new Signal(450), []);
  const width = useMemo(() => new Signal(500), []);
  const intialMaxHeight = useRef<number>(450);
  const intialWidth = useRef<number>(500);
  const containerRef = useRef<ComponentInternals>(null);
  const handleRef = useMemo(
    () =>
      new Proxy<RefObject<Object3D | null>>(
        { current: null },
        { get: () => containerRef.current?.interactionPanel }
      ),
    []
  );
  const innerTarget = useRef<Group>(null);

  const handleDelete = () => {
    console.log("deleting node", node.id);
    deleteNode(node.id);
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      height.value = 700; // Max height
      width.value = 800; // Max width
    } else {
      height.value = 450; // Reset to initial height
      width.value = 500; // Reset to initial width
    }
  };

  const handleEdit = async () => {
    console.log("editing node", node.id);
    await xrStore.getState().session?.end();
    updateViewport({
      vrFrom: viewport.is3D,
      is3D: null,
      expandedNodeId: node.id,
    });
  };

  return (
    <group position={position}>
      <HandleTarget>
        <group ref={ref} pointerEventsType={{ deny: "grab" }}>
          <group ref={innerTarget}>
            <Root
              anchorY="bottom"
              width={width}
              height={height}
              alignItems="center"
              flexDirection="column"
              pixelSize={0.0015}
            >
              <Handle
                translate="as-scale"
                targetRef={innerTarget}
                apply={(state) => {
                  if (state.first) {
                    intialMaxHeight.current = height.value;
                    intialWidth.current = width.value;
                  } else if (
                    intialMaxHeight.current != null &&
                    intialWidth.current != null
                  ) {
                    height.value = MathUtils.clamp(
                      state.current.scale.y * intialMaxHeight.current,
                      250,
                      700
                    );
                    width.value = MathUtils.clamp(
                      state.current.scale.x * intialWidth.current,
                      400,
                      800
                    );
                  }
                }}
                handleRef={handleRef}
                rotate={false}
                multitouch={false}
                scale={{ z: false }}
              >
                <Container
                  pointerEventsType={{ deny: "touch" }}
                  ref={containerRef}
                  positionType="absolute"
                  positionTop={-26}
                  width={26}
                  height={26}
                  backgroundColor={colors.background}
                  borderRadius={100}
                  positionRight={-26}
                  panelMaterialClass={GlassMaterial}
                  borderBend={0.4}
                  borderWidth={4}
                ></Container>
              </Handle>

              <Card
                hover={{ borderColor: "rgb(94,6,65)" }}
                dark={{
                  borderColor: "rgb(63,6,45)",
                  backgroundColor: "rgb(30,5,22)",
                }}
                width="100%"
                flexGrow={1}
                borderWidth={4}
                borderColor="rgb(221,221,221)"
                backgroundColor="rgb(255,255,255)"
                display="flex"
                flexDirection="column"
              >
                <CardHeader
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  padding={2}
                  borderBottomWidth={1}
                  flexShrink={0}
                >
                  <Container display="flex" alignItems="center">
                    {node.type === "text" ? (
                      <TypeIcon marginLeft={8} marginRight={8} />
                    ) : (
                      <FileIcon marginLeft={8} marginRight={8} />
                    )}
                    <Container
                      dark={{ backgroundColor: "rgb(63,6,45)" }}
                      height={24}
                      width={1}
                      backgroundColor="rgb(221,221,221)"
                      marginLeft={2}
                      marginRight={2}
                      flexDirection="column"
                    ></Container>
                    <Container
                      display="flex"
                      alignItems="center"
                      marginLeft={8}
                      gap={8}
                      maxWidth={200}
                    >
                      <Text
                        fontSize={14}
                        lineHeight={20}
                        fontWeight={500}
                        color="rgb(63,6,45)"
                        dark={{ color: "rgb(255,255,255)" }}
                        flexDirection="column"
                      >
                        {node.label}
                      </Text>
                    </Container>
                  </Container>
                  <Container display="flex" alignItems="center">
                    <Button variant="ghost" size="icon" onClick={handleEdit}>
                      <PencilIcon height={16} width={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleExpand}>
                      <MaximizeIcon height={16} width={16} />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete}>
                      <Trash2Icon
                        height={16}
                        width={16}
                        hover={{ color: "rgb(180,14,122)" }}
                      />
                    </Button>
                  </Container>
                </CardHeader>
                <CardContent
                  padding={16}
                  flexGrow={1}
                  alignItems="flex-start"
                  overflow="scroll"
                  scrollbarOpacity={0.2}
                  scrollbarBorderRadius={4}
                >
                  <Container paddingTop={4} flexDirection="column">
                    {convertVrJsonToUIKit(node.vrText || {})}
                  </Container>
                </CardContent>
              </Card>
              <BarHandle ref={storeRef} />
            </Root>
          </group>
        </group>
      </HandleTarget>
    </group>
  );
}
const BarHandle = forwardRef<HandleStore<any>, {}>((props, ref) => {
  const containerRef = useRef<ComponentInternals>(null);
  const handleRef = useMemo(
    () =>
      new Proxy<RefObject<Object3D | null>>(
        { current: null },
        { get: () => containerRef.current?.interactionPanel }
      ),
    []
  );
  return (
    <Handle
      ref={ref}
      handleRef={handleRef}
      targetRef="from-context"
      scale={false}
      multitouch={false}
      rotate={false}
    >
      <Container
        panelMaterialClass={GlassMaterial}
        borderBend={0.4}
        borderWidth={4}
        pointerEventsType={{ deny: "touch" }}
        marginTop={10}
        hover={{
          maxWidth: 240,
          width: "100%",
          backgroundColor: colors.accent,
          marginX: 10,
          marginTop: 6,
          height: 18,
          transformTranslateY: 2,
        }}
        cursor="pointer"
        ref={containerRef}
        width="90%"
        maxWidth={200}
        height={14}
        borderRadius={10}
        backgroundColor={colors.background}
        marginX={20}
      ></Container>
    </Handle>
  );
});

export function convertVrJsonToUIKit(json: JSONContent) {
  if (!json) return null;

  if (json.image) {
    return <Image src={json.image} height={200} width={200} />;
  }
  if (!json.content) return null;
  return json.content.map((paragraph, pIdx) => {
    if (paragraph.type !== "paragraph") return null;

    return (
      <Container
        key={pIdx}
        flexDirection="row"
        flexWrap="wrap" // <--- important!
        alignItems="flex-end"
        gap={4}
        paddingTop={8}
      >
        {paragraph.content?.map((node, nodeIdx) => {
          if (node.type === "hardBreak") {
            // Add a full-width empty block to simulate a line break
            return (
              <Container
                key={`break-${nodeIdx}`}
                width="100%"
                height={8} // adjust space between lines
              />
            );
          }

          if (node.type === "text") {
            const isBold = node.marks?.some((mark) => mark.type === "bold");
            const themeMark = node.marks?.find(
              (mark) => mark.type === "themeMark"
            );
            const hasMultipleColors = themeMark?.attrs?.color?.length > 1;
            const themeColor = themeMark?.attrs?.color?.[0] || "transparent";

            return (
              <Container
                key={nodeIdx}
                flexDirection="column"
                alignItems="center"
                positionType="relative" // <-- very important!
              >
                <Text
                  fontSize={14}
                  fontWeight={isBold ? 700 : 400}
                  lineHeight={20}
                >
                  {node.text}
                </Text>

                {/* Underline - absolutely positioned */}
                {themeMark ? (
                  <Container
                    positionType="absolute"
                    positionBottom={0}
                    width="100%"
                    flexDirection="row"
                    height={2}
                  >
                    {themeMark.attrs?.color?.map(
                      (color: string, index: number) => (
                        <Container
                          key={index}
                          width={`${100 / (themeMark.attrs?.color.length || 1)}%`}
                          height="100%"
                          backgroundColor={color}
                          borderRadius={1}
                        />
                      )
                    )}
                  </Container>
                ) : (
                  <Container
                    positionType="absolute"
                    positionBottom={0}
                    width="100%"
                    height={2}
                    backgroundColor="transparent"
                    borderRadius={1}
                    panelMaterialClass={GlassMaterial}
                  />
                )}
              </Container>
            );
          }

          return null;
        })}
      </Container>
    );
  });
}

export function Toolbar({ position }: { position: [number, number, number] }) {
  const { theme, setTheme } = useTheme();
  const {
    controls,
    canvas: { viewport },
  } = useCanvas();
  const { updateViewport } = controls;
  const inAR = useXR((s) => s.mode === "immersive-ar");

  const handleExit = async () => {
    await xrStore.getState().session?.end();
    updateViewport({ is3D: null });
  };

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleEnvironmentToggle = () => {
    updateViewport({
      vrEnvironment: viewport.vrEnvironment === "space" ? "room" : "space",
    });
  };

  const ref = useRef<Group>(null);
  const innerTarget = useRef<Group>(null);
  const storeRef = useRef<HandleStore<any>>(null);

  useFrame((state, dt) => {
    if (ref.current == null || storeRef.current?.getState() == null) {
      return;
    }
    state.camera.getWorldPosition(vectorHelper1);
    ref.current.getWorldPosition(vectorHelper2);
    quaternionHelper.setFromUnitVectors(
      zAxis,
      vectorHelper1.sub(vectorHelper2).normalize()
    );
    eulerHelper.setFromQuaternion(quaternionHelper, "YXZ");
    ref.current.rotation.y = MathUtils.damp(
      ref.current.rotation.y,
      eulerHelper.y,
      10,
      dt
    );
  });

  return (
    <group position={position}>
      <HandleTarget>
        <group ref={ref} pointerEventsType={{ deny: "grab" }}>
          <group ref={innerTarget}>
            <Root
              anchorY="bottom"
              width={250}
              height={60}
              alignItems="center"
              flexDirection="column"
              pixelSize={0.0015}
            >
              <Card
                hover={{ borderColor: "rgb(94,6,65)" }}
                dark={{
                  borderColor: "rgb(63,6,45)",
                  backgroundColor: "rgb(30,5,22)",
                }}
                width="100%"
                height="100%"
                borderWidth={4}
                borderColor="rgb(221,221,221)"
                backgroundColor="rgb(255,255,255)"
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="space-around"
                gap={8}
                padding={8}
              >
                <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
                  {theme === "dark" ? (
                    <Sun height={16} width={16} />
                  ) : (
                    <Moon height={16} width={16} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEnvironmentToggle}
                >
                  {viewport.vrEnvironment === "room" ? (
                    <Rocket height={16} width={16} />
                  ) : (
                    <Building2 height={16} width={16} />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={handleExit}>
                  <X height={16} width={16} />
                </Button>
              </Card>
              <BarHandle ref={storeRef} />
            </Root>
          </group>
        </group>
      </HandleTarget>
    </group>
  );
}
