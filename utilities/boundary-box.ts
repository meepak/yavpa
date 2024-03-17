import { createPathdata, getViewBoxTrimmed } from "./helper";
import { shapeData } from "./shapes";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PathDataType } from "./types";

export const getBoundaryBox = (selectedPaths: PathDataType[]):PathDataType => {
    let maxStrokeWidth = 0;
    selectedPaths.forEach((item) => {
      if (item.strokeWidth > maxStrokeWidth) {
        maxStrokeWidth = item.strokeWidth;
      }
    });
    let offset = maxStrokeWidth / 2 + 2;
    const vbbox = getViewBoxTrimmed(selectedPaths, offset);
    const vbbPoints = vbbox.split(" ");
    const rectPath = shapeData({
      name: "rectangle",
      start: { x: parseFloat(vbbPoints[0]), y: parseFloat(vbbPoints[1]) },
      end: { x: parseFloat(vbbPoints[0]) + parseFloat(vbbPoints[2]), y: parseFloat(vbbPoints[1]) + parseFloat(vbbPoints[3]) }
    });

    // four dot circles in 4 cornors
    // let circlePaths:string[] = [];
    // for (let i = 0; i < 4; i++) {
    //   let x = parseFloat(vbbPoints[0]) + (i % 2 === 0 ? 0 : parseFloat(vbbPoints[2]));
    //   let y = parseFloat(vbbPoints[1]) + (i < 2 ? 0 : parseFloat(vbbPoints[3]));
    //   circlePaths.push(shapeData({
    //     name: "circle",
    //     start: { x: x-2, y: y-2 },
    //     end: { x: x+2, y: y+2 }
    //   }));
    // }
    // combine 4 cirle path and a rect path
    let path = rectPath;
    // circlePaths.forEach((item) => {
    //   path += item;
    // });

  const rectPathData = createPathdata("#000000", 3, 1);
    rectPathData.visible = true;
  rectPathData.path = path;
    rectPathData.strokeDasharray = "7,7";
    rectPathData.strokeDashoffset = 4;
    return rectPathData;
  }

  export const getCanvasAsBoundaryBox = () => {
    const pathData = createPathdata("#fdf9b4", 3, 1);
    pathData.path = `M0 0 L${CANVAS_WIDTH} 0 L${CANVAS_WIDTH} ${CANVAS_HEIGHT} L0 ${CANVAS_HEIGHT} Z`;
    pathData.strokeDasharray = "7,7";
    pathData.strokeDashoffset = 0;
    return pathData;
  }

