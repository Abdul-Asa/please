import { Button } from "@/components/ui/button";
import { useCanvas } from "../useCanvas";
export function VRCanvas() {
  const {
    controls: { updateViewport },
  } = useCanvas();

  return (
    <Button onClick={() => updateViewport({ is3D: true })}>Enter VR</Button>
  );
}
