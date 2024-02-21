// https://github.com/dabbott/svg-to-lottie
import { format } from "d3";
import { getPointsFromPath } from "./helper";
import { PointType } from "./types";

type curvePointType = {point:[number, number], curveFrom:[number, number], curveTo: [number, number]};

function convertPath(path: string) {
  const points = getPointsFromPath(path);

  const groups:any[] = []; //to be defined type later
  const curvePoints:curvePointType[] = [];

  function convertPoints(curvePoints: any[], isClosed: boolean) {
    return curvePoints.reduce(
      (result: { i: any; o: any; v: any; }, curvePoint: { point: any; curveFrom: any; curveTo: any; }) => {
        const { point, curveFrom, curveTo } = curvePoint;
        const { i, o, v } = result;

        i.push(curveFrom);
        o.push(curveTo);
        v.push(point);

        return result;
      },
      { i: [], o: [], v: [], c: isClosed }
    );
  }

  points.forEach((point: PointType) => {
    // Do something with each point
    curvePoints.push({
      point: [point.x, point.y],
      curveFrom: [0, 0],
      curveTo: [0, 0]
    });
  });


  if (curvePoints.length > 0) {
    groups.push(convertPoints(curvePoints, false) as any);
  }

  return groups;
}

function hexToRgba(hex: string, opacity?: number) {
  let r = 0, g = 0, b = 0;
  if (hex.length == 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length == 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  const rgb = [r / 255, g / 255, b / 255];
  if(opacity) {
    rgb.push(opacity);
  }
  return rgb;
}

function createEllipseShape({ x, y, width, height }) {
  return {
    d: 1,
    ty: "el",
    s: {
      a: 0,
      k: [width, height],
      ix: 2
    },
    p: {
      a: 0,
      k: [x, y],
      ix: 3
    },
    nm: "Ellipse Path 1",
    mn: "ADBE Vector Shape - Ellipse",
    hd: false
  };
}

function createShapeItem(points: curvePointType) {
  return {
    hd: false,
    ind: 0,
    ix: 1,
    ks: {
      a: 0,
      ix: 2,
      k: points
    },
    mn: "ADBE Vector Shape - Group",
    nm: "Path 1",
    ty: "sh"
  };
}

function createShape(items: any, hexColor: string, opacity?: number) {
  const fillColor = hexToRgba(hexColor, opacity);

  return {
    cix: 2,
    hd: false,
    it: [
      ...items,
      {
        c: {
          a: 0,
          ix: 4,
          k: [
            fillColor[0],
            fillColor[1],
            fillColor[2],
            fillColor[3] || 1
          ]
        },
        hd: false,
        mn: "ADBE Vector Graphic - Fill",
        nm: "Fill 1",
        o: {
          a: 0,
          ix: 5,
          k: 100
        },
        r: 1,
        ty: "fl"
      },
      {
        a: {
          a: 0,
          ix: 1,
          k: [0, 0]
        },
        nm: "Transform",
        o: {
          a: 0,
          ix: 7,
          k: 100
        },
        p: {
          a: 0,
          ix: 2,
          k: [0, 0]
        },
        r: {
          a: 0,
          ix: 6,
          k: 0
        },
        s: {
          a: 0,
          ix: 3,
          k: [100, 100]
        },
        sa: {
          a: 0,
          ix: 5,
          k: 0
        },
        sk: {
          a: 0,
          ix: 4,
          k: 0
        },
        ty: "tr"
      }
    ],
    ix: 1,
    mn: "ADBE Vector Group",
    nm: "Shape 1",
    np: 3,
    ty: "gr"
  };
}

function createLayer(shapes: any) {
  return {
    shapes,
    ao: 0,
    bm: 0,
    ddd: 0,
    ind: 1,
    ip: 0,
    ks: {
      a: {
        a: 0,
        ix: 1,
        k: [0, 0, 0]
      },
      o: {
        a: 0,
        ix: 11,
        k: 100
      },
      p: {
        a: 0,
        ix: 2,
        k: [0, 0, 0]
      },
      r: {
        a: 0,
        ix: 10,
        k: 0
      },
      s: {
        a: 0,
        ix: 6,
        k: [100, 100, 100]
      }
    },
    nm: "Shape Layer 1",
    op: 120,
    sr: 1,
    st: 0,
    ty: 4
  };
}

function createFile(options: { width: number; height: number; }) {
  const { width, height } = options;

  return {
    assets: [],
    ddd: 0,
    fr: 24,
    h: height,
    ip: 0,
    nm: "Comp 1",
    op: 120,
    v: "4.12.0",
    w: width,
    layers: []
  };
}

// module.exports = {
//   createShapeItem,
//   createEllipseShape,
//   createShape,
//   createLayer,
//   createFile,
//   convertPath
// };

// lets just worry about display static lottie, and than we will see about animation
function formatLottieData(svgData: SvgDataType) {

  // Extract width and height from viewBox
  const viewBox = svgData.metaData.viewBox.split(' ');
  const width = Math.round(parseFloat(viewBox[2]));
  const height = Math.round(parseFloat(viewBox[3]));

  const layers:any[] = [];
  svgData.pathData.forEach((path) => {
    const pathData = convertPath(path.path);
    const items = pathData.map(createShapeItem);
    const shape = createShape(items, path.stroke, path.strokeOpacity);
    const layer = createLayer([shape]);
    layers.push(layer);
  });
    const file = createFile({ width, height });
    file.layers  = layers as never;
    const lottieJson = JSON.stringify(file);
    // console.log(lottieJson);
    return lottieJson;
}

export default formatLottieData;