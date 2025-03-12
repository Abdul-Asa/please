import { Direction, Point } from "./types";

export const readFileContent = (file: File): Promise<string | ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Determine how to read the file based on its type
    if (file.type.startsWith("image/")) {
      reader.readAsDataURL(file); // Read images as data URL
    } else if (
      file.type.startsWith("text/") ||
      file.type === "application/json" ||
      file.type === "application/xml" ||
      file.type === "application/javascript" ||
      file.type.includes("document")
    ) {
      reader.readAsText(file); // Read text files as text
    } else {
      reader.readAsArrayBuffer(file); // Read other files as binary
    }

    reader.onload = () => resolve(reader.result as string | ArrayBuffer);
    reader.onerror = (error) => reject(error);
  });
};

// Calculate the anchor point of an edge based on the node and the anchoring side
export function getAnchorPoint(node: HTMLElement, side: Direction) {
  const x = parseInt(node.style.left, 10);
  const y = parseInt(node.style.top, 10);
  const width = node.offsetWidth;
  const height = node.offsetHeight;

  switch (side) {
    case "top":
      return { x: x + width / 2, y: y };
    case "right":
      return { x: x + width, y: y + height / 2 };
    case "bottom":
      return { x: x + width / 2, y: y + height };
    case "left":
      return { x: x, y: y + height / 2 };
    default: // center or unspecified case
      return { x: x + width / 2, y: y + height / 2 };
  }
}

export function createPath(
  fromPoint: Point,
  toPoint: Point,
  _curveTightness: number,
  straightLineLength: number,
  fromSide: Direction,
  toSide: Direction
) {
  let controlPointX1,
    controlPointX2,
    controlPointY1,
    controlPointY2,
    endPointX,
    endPointY;

  if (fromSide === "right" || fromSide === "left") {
    controlPointX1 =
      fromPoint.x +
      (fromSide === "right" ? straightLineLength : -straightLineLength);
    controlPointX2 =
      toPoint.x +
      (toSide === "right" ? straightLineLength : -straightLineLength);
    controlPointY1 = fromPoint.y;
    controlPointY2 = toPoint.y;
    endPointX = controlPointX2;
    endPointY = controlPointY2;
  } else {
    controlPointX1 = fromPoint.x;
    controlPointX2 = toPoint.x;
    controlPointY1 =
      fromPoint.y +
      (fromSide === "bottom" ? straightLineLength : -straightLineLength);
    controlPointY2 =
      toPoint.y +
      (toSide === "bottom" ? straightLineLength : -straightLineLength);
    endPointX = controlPointX2;
    endPointY = controlPointY2;
  }

  return `M ${fromPoint.x} ${fromPoint.y} L ${controlPointX1} ${controlPointY1} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${endPointX} ${endPointY} L ${toPoint.x} ${toPoint.y}`;
}
