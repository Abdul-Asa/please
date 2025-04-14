import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useEffect, useState } from "react";
import { Box, Glasses, Smartphone } from "lucide-react";

export function VRModal() {
  const [open, setOpen] = useState(false);
  const [isXRSupported, setIsXRSupported] = useState(false);

  useEffect(() => {
    // Check if XR is supported
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
        setIsXRSupported(supported);
      });
    }
  }, []);

  const handleEnterVR = async () => {
    // TODO: Implement VR entry logic
    console.log("Entering VR...");
  };

  const handleEnterAR = async () => {
    // TODO: Implement AR entry logic
    console.log("Entering AR...");
  };

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
      <div className="space-y-4">
        {isXRSupported ? (
          <>
            <Button
              className="w-full"
              onClick={handleEnterVR}
              variant="outline"
            >
              <Glasses className="mr-2 h-4 w-4" />
              Enter Virtual Reality
            </Button>
            <Button
              className="w-full"
              onClick={handleEnterAR}
              variant="outline"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Enter Augmented Reality
            </Button>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            Your device does not support VR/AR experiences. Please try on a
            compatible device.
          </div>
        )}
      </div>
    </Modal>
  );
}
