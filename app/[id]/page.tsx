import { Room } from "@/components/canvas/multiplayer/room";
import { Canvas } from "@/components/canvas";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <Room id={id}>
      <Canvas isMultiplayer />
    </Room>
  );
}
