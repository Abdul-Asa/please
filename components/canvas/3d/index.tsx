import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useEffect, useState } from "react";
import { Box, Glasses, Smartphone } from "lucide-react";
import { VR } from "./VRcanvas";
import { useCanvas } from "../useCanvas";

export function VRCanvas() {
  const [open, setOpen] = useState(false);
  const [isXRSupported, setIsXRSupported] = useState(false);
  const { controls } = useCanvas();
  useEffect(() => {
    // Check if XR is supported
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
        setIsXRSupported(supported);
      });
    }
  }, []);

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          tooltip="Enter VR/AR"
          tooltipSide="bottom"
        >
          <Box size={18} />
        </Button>
      }
      title="Enter Virtual/Augmented Reality"
      description="Choose your preferred immersive experience"
    >
      <div className="flex gap-4">
        {!isXRSupported ? (
          <>
            <Button
              className="w-full h-20 flex items-center justify-center"
              variant="outline"
              onClick={() => {
                controls.updateViewport({ is3D: "VR" });
                setOpen(false);
              }}
            >
              <Glasses className="mr-2 h-4 w-4" />
              Enter VR
            </Button>
            <Button
              className="w-full h-20 flex items-center justify-center"
              variant="outline"
              onClick={() => {
                controls.updateViewport({ is3D: "AR" });
                setOpen(false);
              }}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Enter AR
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-center text-muted-foreground">
              Your device does not support VR/AR experiences. Please try on a
              compatible device.
            </div>
            {/* <Button
              className="w-full h-20 flex items-center justify-center"
              variant="outline"
              onClick={() => {
                controls.updateViewport({ is3D: "3D" });
                setOpen(false);
              }}
            >
              <Box className="mr-2 h-4 w-4" />
              Enter 3D
            </Button> */}
          </div>
        )}
      </div>
    </Modal>
  );
}
