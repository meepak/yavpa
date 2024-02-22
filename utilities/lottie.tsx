// https://github.com/dabbott/svg-to-lottie
import { format } from "d3";
import * as Crypto from "expo-crypto";
import { getPointsFromPath } from "./helper";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PointType, SvgDataType } from "./types";

type curvePointType = { point: [number, number], curveFrom: [number, number], curveTo: [number, number] };

function convertPath(path: string) {
  const points = getPointsFromPath(path);

  const groups: any[] = []; //to be defined type later
  const curvePoints: curvePointType[] = [];

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

function hexToRgba(hex: string) {
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
  const rgb: number[] = [];
  if (r >= 0 && r <= 255) rgb.push(r); else rgb.push(0);
  if (g >= 0 && g <= 255) rgb.push(g); else rgb.push(0);
  if (b >= 0 && b <= 255) rgb.push(b); else rgb.push(0);
  return rgb;
}

function createEllipseShape({ x, y, width, height }) {
  return {
    d: 1,
    ty: "el",
    s: {
      a: 0,
      k: [width, height],
    },
    p: {
      a: 0,
      k: [x, y],
    },
    nm: "Ellipse Path 1",
    mn: "ADBE Vector Shape - Ellipse",
  };
}

function createShapeItem(points: curvePointType) {
  return {
    d: 1,
    mn: "{" + Crypto.randomUUID() + "}",
    nm: "Shape",
    ty: "sh",
    ks: {
      a: 0,
      k: points
    }
  };
}

function createShape(items: any, guid: string, strokeColorHex: string, strokeOpacity: number, strokeWidth: number, fillColorHex?: string, fillOpacity?: number,) {
  const strokeColor = hexToRgba(strokeColorHex);
  const strokeOpacityValue = strokeOpacity * 100;

  const fillColor = [0, 0, 0]; //hexToRgba(fillColorHex || '#0000FF'); // default color just for debug, it seems black is default if nothing given
  const fillOpacityValue = 0; //fillOpacity || 0;

  //use guid for group mn

  return {
    ty: "gr",
    mn: "{" + Crypto.randomUUID() + "}",
    nm: "Group",
    it: [
      ...items,
      {
        ty: "fl",
        c: {
          a: 0,
          k: fillColor
        },
        mn: "{" + Crypto.randomUUID() + "}",
        nm: "Fill",
        o: {
          a: 0,
          k: fillOpacityValue
        },
        r: 1
      },
      {
        ty: "st",
        c: {
          a: 0,
          k: strokeColor
        },
        mn: "{" + Crypto.randomUUID() + "}",
        nm: "Stroke",
        o: {
          a: 0,
          k: strokeOpacityValue
        },
        w: {
          a: 0,
          k: strokeWidth || 1
        },
        lc: 2,
        lj: 2,
        ml: 0,
      },
      {
        ty: "tr",
        a: {
          a: 0,
          k: [0, 0]
        },
        o: {
          a: 0,
          k: 100
        },
        p: {
          a: 0,
          k: [0, 0]
        },
        r: {
          a: 0,
          k: 0
        },
        s: {
          a: 0,
          k: [100, 100]
        }
      }
    ]
  };
}

function createLayer(shapes: any) {
  return {
    ddd: 0,
    ty: 4,
    st: 0,
    ip: 0,
    op: 120,
    nm: "Layer",
    mn: "{" + Crypto.randomUUID() + "}",
    ao: 0,
    ks: {
      a: {
        a: 0,
        k: [0, 0, 0]
      },
      o: {
        a: 0,
        k: 100
      },
      p: {
        a: 0,
        k: [0, 0, 0]
      },
      r: {
        a: 0,
        k: 0
      },
      s: {
        a: 0,
        k: [100, 100, 100]
      }
    },
    shapes,
  };
}

function createFile(options: { width: number; height: number; }) {
  const { width, height } = options;

  return {
    v: "5.7.1",
    ip: 0,
    op: 120,
    nm: "Composition",
    mn: "{" + Crypto.randomUUID() + "}",
    fr: 24,
    w: width,
    h: height,
    assets: [],
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
  // const viewBox = svgData.metaData.viewBox.split(' ');
  // const width = Math.round(parseFloat(viewBox[2]));
  // const height = Math.round(parseFloat(viewBox[3]));
  const width =  parseInt(CANVAS_WIDTH.toFixed(0));
  const height = parseInt(CANVAS_HEIGHT.toFixed(0));

  const layers: any[] = [];
  svgData.pathData.forEach((path) => {
    const lottiePath = convertPath(path.path);
    const items = lottiePath.map(createShapeItem);
    const shape = createShape(items, path.guid, path.stroke, path.strokeOpacity, path.strokeWidth);
    const layer = createLayer([shape]);
    layers.push(layer);
  });
  const file = createFile({ width, height });
  file.layers = layers as any;
  const lottieJson = JSON.stringify(file);
  // console.log(lottieJson);
  return lottieJson;
}

export default formatLottieData;