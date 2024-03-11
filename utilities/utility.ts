import { createPathdata, getViewBoxTrimmed } from "./helper";
import { shapeData } from "./shapes";
import { PathDataType } from "./types";

export const getBoundaryBoxPath = (selectedPaths: PathDataType[]):PathDataType => {
    let maxStrokeWidth = 0;
    selectedPaths.forEach((item) => {
      if (item.strokeWidth > maxStrokeWidth) {
        maxStrokeWidth = item.strokeWidth;
      }
    });
    let offset = maxStrokeWidth / 2;
    const vbbox = getViewBoxTrimmed(selectedPaths, offset);
    const vbbPoints = vbbox.split(" ");
    const rectPath = shapeData({
      name: "rectangle",
      start: { x: parseFloat(vbbPoints[0]), y: parseFloat(vbbPoints[1]) },
      end: { x: parseFloat(vbbPoints[0]) + parseFloat(vbbPoints[2]), y: parseFloat(vbbPoints[1]) + parseFloat(vbbPoints[3]) }
    });
  
    const rectPathData = createPathdata("#000000", 3, 1);
    rectPathData.path = rectPath;
    rectPathData.strokeDasharray = "7,7";
    rectPathData.strokeDashoffset = 0;
    return rectPathData;
  }
  
  