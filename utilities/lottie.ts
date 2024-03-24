import * as Crypto from "expo-crypto";
import { getPointsFromPath, precise } from "./helper";
import {
  BrushType,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MY_BLACK,
  PathDataType,
  PointType,
  MyPathDataType } from "./types";
import { Linecap, Linejoin, Path } from "react-native-svg";


const FPS = 24;
type lottiePointType = { point: [number, number], curveFrom: [number, number], curveTo: [number, number] };


function convertPath(path: string) {
  const points = getPointsFromPath(path);

  const groups: any[] = []; //to be defined type later
  const lottiePoints: lottiePointType[] = [];

  function convertPoints(lottiePoints: any[], isClosed: boolean) {
    return lottiePoints.reduce(
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
    lottiePoints.push({
      point: [point.x, point.y],
      curveFrom: [0, 0],
      curveTo: [0, 0]
    });
  });


  if (lottiePoints.length > 0) {
    groups.push(convertPoints(lottiePoints, false) as any);
  }

  return groups;
}

function hexToRgb(hex: string) {
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

function createShape(points: lottiePointType) {
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

function createFill(color: number[], opacity: number) {
  return {
    ty: "fl",
    c: {
      a: 0,
      k: color
    },
    mn: "{" + Crypto.randomUUID() + "}",
    nm: "Fill",
    o: {
      a: 0,
      k: opacity
    },
    r: 1
  };
}

function createStroke(color: number[], opacity: number, width: number) {
  return {
    ty: "st",
    c: {
      a: 0,
      k: color
    },
    mn: "{" + Crypto.randomUUID() + "}",
    nm: "Stroke",
    o: {
      a: 0,
      k: opacity
    },
    w: {
      a: 0,
      k: width
    },
    lc: 2,
    lj: 2,
    ml: 0,
  };
}

function createTransform() {
  return {
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
  };
}

function createGroup(path: PathDataType, pathStartFrame: number, pathEndFrame: number) {

  const strokeColor = hexToRgb(path.stroke ?? MY_BLACK);
  const strokeOpacity = (path.strokeOpacity ?? 1) * 100;
  const strokeWidth = path.strokeWidth ?? 2;
  const fillColor = [0, 0, 0];
  const fillOpacity = 0;


  const lottiePath = convertPath(path.path);
  const shapes = lottiePath.map(createShape);
  const shapeFill = createFill(fillColor, fillOpacity);
  const shapeStroke = createStroke(strokeColor, strokeOpacity, strokeWidth);

  const trimPaths = createTrimPaths(path, pathStartFrame, pathEndFrame);

  const shapeTransform = createTransform();
  return {
    ty: "gr",
    mn: "{" + path.guid + "}",
    nm: "Group",
    it: [
      ...shapes,
      shapeFill,
      shapeStroke,
      trimPaths,
      shapeTransform // must be last
    ]
  };
}

function createLayer(path: PathDataType, pathStartFrame: number,  pathEndFrame: number, totalFrames: number) {

  const group = [createGroup(path, pathStartFrame, pathEndFrame)];
  return {
    ddd: 0,
    ty: 4,
    st: 0,
    ip: pathStartFrame,
    op: totalFrames,
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
    shapes: group,
  };
}

function createComposition(options: { width: number; height: number; totalFrames: number}) {
  const { width, height, totalFrames } = options;

  return {
    v: "5.7.1",
    ip: 0,
    op: totalFrames,
    nm: "Composition",
    mn: "{" + Crypto.randomUUID() + "}",
    fr: 24,
    w: width,
    h: height,
    assets: [],
    layers: []
  };
}

// ----------- animation function start ------------

function createTrimPaths(path: PathDataType, pathStartFrame: number, pathEndFrame: number) {
  const start = 0;
  const end = 100;
  // const offset = 0;
  return {
    ty: "tm",
    nm: "Trim Paths 1",
    mn: "{" + Crypto.randomUUID() + "}",
    s: {
      a: 1,
      k: [
        {
          t: pathStartFrame,
          s: [start],
          h: 0
        },
        {
          t: pathEndFrame,
          s: [end]
        }
      ]
    },
    e: {
      a: 0,
      k: 0
    },
    o: {
      a: 0,
      k: 0
    },
    m: 1,
  };
}

// ------------ animation function end ------------

function createLottie(myPathData: MyPathDataType) {
  // Extract width and height from viewBox
  // const viewBox = myPathData.metaData.viewBox.split(' ');
  // const width = Math.round(parseFloat(viewBox[2]));
  // const height = Math.round(parseFloat(viewBox[3]));
  const width = parseInt(CANVAS_WIDTH.toFixed(0));
  const height = parseInt(CANVAS_HEIGHT.toFixed(0));

  const layers: any[] = [];

  // make deep copy of myPathData.pathData and reverse it
  const clonedPathData = JSON.parse(JSON.stringify(myPathData.pathData));

  const speed = myPathData.metaData.animation?.speed || 1;
  const totalTime = clonedPathData.reduce((acc: number, path: PathDataType) => acc + path.time, 0);
  const totalFrames = FPS * precise(totalTime / (1000 * speed), 0);

  let pathStartFrame = 0;
  let index = 0;
  clonedPathData.forEach((path: PathDataType) => {
    const pathTotalFrames = FPS * precise(path.time / (1000 * speed), 0)
    const layer = createLayer(path, pathStartFrame, pathTotalFrames + pathStartFrame, totalFrames);
    layers.push(layer);
    pathStartFrame += pathTotalFrames;
    index++;
  });

  // const totalFrames = pathStartFrame;
  const lottie = createComposition({ width, height,  totalFrames});
  lottie.layers = layers.reverse() as any; //reverse so the stacking layer matches of svg

  const lottieJson = JSON.stringify(lottie);
  // myConsole.log(lottieJson);
  return lottieJson;
}

export default createLottie;