// https://github.com/dabbott/svg-to-lottie
import { format } from "d3";
import * as Crypto from "expo-crypto";
import { getPointsFromPath } from "./helper";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PointType } from "./types";

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
    hd: false
  };
}

function createShapeItem(points: curvePointType) {
  return {
    hd: false,
    ind: 0,
    ks: {
      a: 0,
      k: points
    },
    mn: "{" + Crypto.randomUUID() + "}",
    nm: "Shape",
    ty: "sh"
  };
}

function createShape(items: any, guid: string, strokeColorHex: string, strokeOpacity: number, strokeWidth: number, fillColorHex?: string, fillOpacity?: number,) {
  const strokeColor = hexToRgba(strokeColorHex);
  const strokeOpacityValue = strokeOpacity * 100;

  const fillColor = [0, 0, 0]; //hexToRgba(fillColorHex || '#0000FF'); // default color just for debug, it seems black is default if nothing given
  const fillOpacityValue = 0; //fillOpacity || 0;


  return {
    cix: 2,
    hd: false,
    it: [
      ...items,
      {
        c: {
          a: 0,
          k: fillColor
        },
        hd: false,
        mn: "{" + Crypto.randomUUID() + "}",
        nm: "Fill",
        o: {
          a: 0,
          k: fillOpacityValue
        },
        r: 1,
        ty: "fl"
      },
      {
        c: {
          a: 0,
          k: strokeColor
        },
        hd: false,
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
        lc: 1,
        lj: 1,
        ml: 4,
        ty: "st"
      },
      {
        a: {
          a: 0,
          k: [0, 0]
        },
        nm: "Transform",
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
        },
        sa: {
          a: 0,
          k: 0
        },
        sk: {
          a: 0,
          k: 0
        },
        ty: "tr"
      }
    ],
    mn: "{" + guid + "}",
    nm: "Group",
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
    mn: "{" + Crypto.randomUUID() + "}",
    nm: "Layer",
    op: 120,
    sr: 1,
    st: 0,
    ty: 4
  };
}

// 4.12.0
function createFile(options: { width: number; height: number; }) {
  const { width, height } = options;

  return {
    assets: [],
    ddd: 0,
    fr: 24,
    h: height,
    ip: 0,
    mn: "{" + Crypto.randomUUID() + "}",
    nm: "Composition",
    op: 120,
    v: "5.7.1",
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
  // const viewBox = svgData.metaData.viewBox.split(' ');
  // const width = Math.round(parseFloat(viewBox[2]));
  // const height = Math.round(parseFloat(viewBox[3]));
  const width = CANVAS_WIDTH;
  const height = CANVAS_HEIGHT;

  const layers: any[] = [];
  svgData.pathData.forEach((path) => {
    const lottiePath = convertPath(path.path);
    const items = lottiePath.map(createShapeItem);
    const shape = createShape(items, path.guid, path.stroke, path.strokeOpacity, path.strokeWidth);
    const layer = createLayer([shape]);
    layers.push(layer);
  });
  const file = createFile({ width, height });
  file.layers = layers as never;
  const lottieJson = JSON.stringify(file);
  // console.log(lottieJson);
  return lottieJson;
}

export default formatLottieData;