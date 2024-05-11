import { createPathdata, getViewBoxTrimmed } from "@u/helper";
import { shapeData } from "@u/shapes";
import { MY_BLACK, PathDataType, PointType } from "@u/types";

const boundaryBoxCornors = (
  activeBoundaryBoxPath: PathDataType | undefined,
  scaleFactor = 1,
) => {
  if (!activeBoundaryBoxPath?.path) {
    return null;
  }

  const vbbox = getViewBoxTrimmed([activeBoundaryBoxPath], 0);
  if(!vbbox) {
    return null;
  }
  const vbbPoints = vbbox.split(" ");
  // Create corner paths
  const cornerStrokeWidth = 5 * scaleFactor;
  // Make cornerLength proportional to the size of the boundary box
  const cornerLength =
    Math.min(Number.parseFloat(vbbPoints[2]), Number.parseFloat(vbbPoints[3])) /
    10;
  const corners = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
  return corners.flatMap((corner) => {
    const cornerPathData1 = createPathdata(MY_BLACK, cornerStrokeWidth, 1);
    const cornerPathData2 = createPathdata(MY_BLACK, cornerStrokeWidth, 1);
    cornerPathData1.visible = true;
    cornerPathData2.visible = true;
    cornerPathData1.strokeDasharray = "0"; // Solid line
    cornerPathData2.strokeDasharray = "0"; // Solid line
    cornerPathData1.strokeDashoffset = 0;
    cornerPathData2.strokeDashoffset = 0;

    // Adjust start and end points based on the corner
    let start1: PointType;
    let end1: PointType;
    let start2: PointType;
    let end2: PointType;

    switch (corner) {
      case "topLeft": {
        start1 = {
          x: Number.parseFloat(vbbPoints[0]),
          y: Number.parseFloat(vbbPoints[1]),
        };
        end1 = { x: start1.x + cornerLength, y: start1.y };
        start2 = {
          x: Number.parseFloat(vbbPoints[0]),
          y: Number.parseFloat(vbbPoints[1]),
        };
        end2 = { x: start2.x, y: start2.y + cornerLength };
        break;
      }

      case "topRight": {
        start1 = {
          x: Number.parseFloat(vbbPoints[0]) + Number.parseFloat(vbbPoints[2]),
          y: Number.parseFloat(vbbPoints[1]),
        };
        end1 = { x: start1.x - cornerLength, y: start1.y };
        start2 = {
          x: Number.parseFloat(vbbPoints[0]) + Number.parseFloat(vbbPoints[2]),
          y: Number.parseFloat(vbbPoints[1]),
        };
        end2 = { x: start2.x, y: start2.y + cornerLength };
        break;
      }

      case "bottomLeft": {
        start1 = {
          x: Number.parseFloat(vbbPoints[0]),
          y: Number.parseFloat(vbbPoints[1]) + Number.parseFloat(vbbPoints[3]),
        };
        end1 = { x: start1.x + cornerLength, y: start1.y };
        start2 = {
          x: Number.parseFloat(vbbPoints[0]),
          y: Number.parseFloat(vbbPoints[1]) + Number.parseFloat(vbbPoints[3]),
        };
        end2 = { x: start2.x, y: start2.y - cornerLength };
        break;
      }

      case "bottomRight": {
        start1 = {
          x: Number.parseFloat(vbbPoints[0]) + Number.parseFloat(vbbPoints[2]),
          y: Number.parseFloat(vbbPoints[1]) + Number.parseFloat(vbbPoints[3]),
        };
        end1 = { x: start1.x - cornerLength, y: start1.y };
        start2 = {
          x: Number.parseFloat(vbbPoints[0]) + Number.parseFloat(vbbPoints[2]),
          y: Number.parseFloat(vbbPoints[1]) + Number.parseFloat(vbbPoints[3]),
        };
        end2 = { x: start2.x, y: start2.y - cornerLength };
        break;
      }

      default: {
        start1 = { x: 0, y: 0 };
        end1 = { x: 0, y: 0 };
        start2 = { x: 0, y: 0 };
        end2 = { x: 0, y: 0 };
        break;
      }
    }

    const cornerPath1 = shapeData({
      name: "line",
      start: start1,
      end: end1,
    });

    const cornerPath2 = shapeData({
      name: "line",
      start: start2,
      end: end2,
    });

    cornerPathData1.path = cornerPath1;
    cornerPathData2.path = cornerPath2;

    return [cornerPathData1, cornerPathData2];
  });
};

export default boundaryBoxCornors;
