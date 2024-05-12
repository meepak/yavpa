import createShapeit from "@l/shapeit/src";
import { shapeData } from "@u/shapes";
import { getPathFromPoints, getPointsFromPath } from "@u/helper";
import { PointType } from "@u/types";

// Detect shape in handwritten drawing using shapeit
// Returns detected shape points or undefined
const detectShape = (pathPoints: PointType[]) => {
  const shapeVertices = pathPoints.map((point) => [point.x, point.y]);

  const detectedShape = createShapeit(shapeVertices);

  console.log("Detected and corrected shape is: ", detectedShape.name);

  const isClosed = detectedShape.closed;
  console.log("Is the shape closed?: ", isClosed);

  let validShapePoints:PointType[] = [];

    switch (detectedShape.name) {
      case "circle":
        const center = detectedShape.center;
        const radius = detectedShape.radius;
        const startPoint = {
          x: center[0] - radius / 2,
          y: center[1],
        };
        const endPoint = {
          x: center[0] + radius / 2,
          y: center[1],
        };
        const circleShape = shapeData({
          name: detectedShape.name,
          start: startPoint,
          end: endPoint,
        });
        validShapePoints = getPointsFromPath(circleShape);
        break;
      case "vector":
      case "random open polygon":
      case "silver-ratio triangle":
      case "equilateral triangle":
      case "equilateral pentagon":
      case "equilateral hexagon":
      case "golden-ratio triangle":
      case "rhombus":
      case "trapezoid":
      case "concave quadrilateral":
      case "spark":
      case "star":
        validShapePoints = detectedShape.map((point) => ({
          x: point[0],
          y: point[1],
        }));
        break;
    }

  if (validShapePoints.length === 0) {
    console.log("Shape not detected");
    return;
  }
  return validShapePoints;
};

export default detectShape;
