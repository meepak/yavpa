import { Linecap, Linejoin } from "react-native-svg";
import * as Crypto from "expo-crypto";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CANVAS_VIEWBOX,
  PRECISION,
  PointType,
  ScreenModes,
  TransitionType,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  Orientation,
  I_AM_ANDROID,
  ImageDataType,
} from "./types";
import { PathDataType, MyPathDataType, OrientationType } from "./types";
import { polygonContains, polygonLength } from "d3-polygon";
import path from "path";
import { Accelerometer } from "expo-sensors";
import simplify from "simplify-js";
import { line, curveBasis } from "d3-shape";
import myConsole from "@c/my-console-log";

export const createMyPathData = (): MyPathDataType => ({
  pathData: [],
  imageData: [],
  metaData: {
    guid: "",
    created_at: Date.now().toString(),
    updatedAt: Date.now().toString(),
    name: "",
    viewBox: `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`,
    lastScreenMode: ScreenModes[0].name,
    editable: true,
    animation: {
      speed: 1,
      loop: true,
      delay: 0,
      transition: 0,
      transitionType: TransitionType.None,
      correction: 0.05,
    },
  },
  updatedAt: new Date().toString(),
});

// not used but keeping for reference
export const createPathdata = (
  stroke?: string,
  strokeWidth?: number,
  strokeOpacity?: number,
  strokeCap?: Linecap,
  strokeJoin?: Linejoin,
  strokeFill?: string,
  strokeDasharray?: string | undefined,
  strokeDashoffset?: number | undefined,
): PathDataType => ({
  type: "d",
  path: "",
  stroke: stroke ?? "#120e31",
  strokeWidth: strokeWidth ?? 2,
  strokeOpacity: strokeOpacity ?? 1,
  strokeCap: strokeCap ?? "round", // other support in next version only
  strokeJoin: strokeJoin ?? "round",
  fill: strokeFill ?? "none",
  strokeDasharray: strokeDasharray ?? undefined,
  strokeDashoffset: strokeDashoffset ?? undefined,
  length: 0,
  time: 0,
  visible: false,
  guid: "", //without guid it's not a valid path though
  selected: false,
});

export const createImageData = (
  guid: string,
  data: string,
  width: number,
  height: number,
): ImageDataType => ({
  type: "image",
  guid: guid,
  data: data,
  width: width,
  height: height,
  x: 0,
  y: 0,
  visible: false,
  rotation: 0,
  scale: 1,
  opacity: 1,
  selected: false,
});

export const precise = (num: string | number, precision = PRECISION): number =>
  parseFloat(parseFloat(num as string).toFixed(precision));

export const isValidPath = (path: string): boolean => {
  if (path === undefined || path === null) return false;
  if (path === "") return false;
  let p = path.toUpperCase();
  if (p === "M" || p === "MZ") return false;
  // add any other issue that may happen with path
  if (path.includes("NaN")) return false;
  return true;
};

export const getRealPathFromPoints = (points: PointType[]) => {
  if (!points || points.length === 0) return "";

  const lineGenerator = line<PointType>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(curveBasis); // Use curveBasis for a smooth curve

  return lineGenerator(points) || "";
};

export const getPathFromPoints = (points: PointType[]) => {
  if (!points || points.length === 0) return "";
  const isClosed =
    points[0].x === points[points.length - 1].x &&
    points[0].y === points[points.length - 1].y;
  let path = points
    .map(({ x, y }, index) => {
      if (isClosed && index === points.length - 1) return "";
      return `L${precise(x as unknown as string)},${precise(y as unknown as string)}`;
    })
    .join("");
  path = `M${path.slice(1)}`;
  if (isClosed) {
    path = `${path}Z`;
  }
  return path;
};

// TODO DEFINE RESOLUTION & TOLERANCE AS USER CONFIG
export const getPointsFromPath = (
  path: string,
  resolution: number = 100,
  simplifyTolerance: number = 0.011,
): PointType[] => {
  if (typeof path !== "string") {
    return [];
  }
  if (path === "") {
    return [];
  }
  path = path.trim();

  const isClosed = path.endsWith("Z");

  const commands = path.split(/(?=[MLCZ])/i);
  let firstPoint: PointType | null = null;
  let previousPoint: PointType | null = null;
  const points: PointType[] = [];
  commands.forEach((command) => {
    const type = command[0].toUpperCase();
    const coords = command.slice(1).split(",").map(Number);
    let point: PointType | null = null;
    switch (type) {
      case "C":
        const cPoints: PointType[] = [];
        for (let t = 0; t <= resolution; t++) {
          const s = t / resolution;
          const x =
            Math.pow(1 - s, 3) * (previousPoint?.x || 0) +
            3 * Math.pow(1 - s, 2) * s * coords[0] +
            3 * (1 - s) * Math.pow(s, 2) * coords[2] +
            Math.pow(s, 3) * coords[4];
          const y =
            Math.pow(1 - s, 3) * (previousPoint?.y || 0) +
            3 * Math.pow(1 - s, 2) * s * coords[1] +
            3 * (1 - s) * Math.pow(s, 2) * coords[3] +
            Math.pow(s, 3) * coords[5];
          points.push({ x, y });
        }
        point = { x: coords[4], y: coords[5] };
        break;
      case "M":
      case "L":
        let lastPoint = points[points.length - 1];
        if (lastPoint) {
          let distance = Math.sqrt(
            Math.pow(coords[0] - lastPoint.x, 2) +
              Math.pow(coords[1] - lastPoint.y, 2),
          );
          if (distance > resolution) {
            let numberOfPoints = Math.floor(distance / resolution);
            for (let i = 0; i < numberOfPoints; i++) {
              let t = i / numberOfPoints;
              let x = lastPoint.x + (coords[0] - lastPoint.x) * t;
              let y = lastPoint.y + (coords[1] - lastPoint.y) * t;
              points.push({ x, y });
            }
          }
        }
        point = { x: coords[0], y: coords[1] };
        points.push(point);
        if (firstPoint === null) {
          firstPoint = point;
        }
        break;
      default:
        point = null;
    }
    previousPoint = point;
  });

  // myConsole.log(points.length, "Points");

  //simplify cPoints to reduce number of points
  const simplifiedPoints = simplify(points, simplifyTolerance);

  // myConsole.log(simplifiedPoints.length, "simplifiedPoints");

  if (isClosed) {
    simplifiedPoints.push({
      x: simplifiedPoints[0].x,
      y: simplifiedPoints[0].y,
    });
  }

  return simplifiedPoints;
};

export const getPathLength = (points: PointType[]): number => {
  return polygonLength(points.map((point) => [point.x, point.y]));
};

export const pathContainsPoint = (path: string, checkPoint: PointType) => {
  const points = getPointsFromPath(path);
  const d3Points = points.map(
    (point) => [point.x, point.y] as [number, number],
  );
  return polygonContains(d3Points, [checkPoint.x, checkPoint.y]);
};

// if given path is atleast half inside canvas
export const isShapeInsideCanvas = (path: string) => {
  const points = getPointsFromPath(path);
  const d3Points = points.map(
    (point) => [point.x, point.y] as [number, number],
  );
  let count = 0;
  d3Points.forEach((point) => {
    if (
      point[0] >= 0 &&
      point[0] <= CANVAS_WIDTH &&
      point[1] >= 0 &&
      point[1] <= CANVAS_HEIGHT
    ) {
      count++;
    }
  });
  return count >= d3Points.length * 0.25;
};

export const isPath1InsidePath2 = (path1: string, path2: string) => {
  const points = getPointsFromPath(path1);
  const d3Points = points.map(
    (point) => [point.x, point.y] as [number, number],
  );
  const path2Points = getPointsFromPath(path2);
  const d3Path2Points = path2Points.map(
    (point) => [point.x, point.y] as [number, number],
  );
  let count = 0;
  d3Points.forEach((point) => {
    if (polygonContains(d3Path2Points, point)) {
      count++;
    }
  });
  return count >= d3Points.length * 0.25;
};

export const getLastPoint = (path: string) => {
  // split function to use a regular expression that splits the string
  // at the position before any SVG command letter.
  const commands = path.trim().split(/(?=[MmLlHhVvCcSsQqTtAaZz])/);
  const lastCommand = commands[commands.length - 1];
  const commandType = lastCommand[0].toUpperCase();
  const parameters = lastCommand.slice(1).split(",");
  let x = parameters[parameters.length - 2];
  let y = parameters[parameters.length - 1];

  return { commandType, x: precise(x), y: precise(y) };
};

export const getViewBoxTrimmed = (pathData: PathDataType[], offset = 20) => {
  let minX = CANVAS_WIDTH ?? SCREEN_WIDTH;
  let minY = CANVAS_HEIGHT ?? SCREEN_HEIGHT;
  let maxX = 0;
  let maxY = 0;
  // let offset = 20;

  //
  if (pathData.length === 0) return `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`;

  // myConsole.log("pathData", pathData)
  pathData.forEach((path) => {
    // myConsole.log("path", path)
    const points = getPointsFromPath(path.path);
    // myConsole.log("points", points);
    points.forEach((point) => {
      if (point.x === undefined || point.y === undefined) {
        // myConsole.log("point.x or point.y is undefined", point);
        return;
      }
      if (Number.isNaN(point.x) || Number.isNaN(point.y)) {
        // myConsole.log("point.x or point.y is NaN", point);
        return;
      }
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });

  const r = (value) => Math.round(value);
  minX = r(minX) ?? 0;
  minY = r(minY) ?? 0;
  maxX = r(maxX) ?? CANVAS_WIDTH ?? SCREEN_WIDTH;
  maxY = r(maxY) ?? CANVAS_HEIGHT ?? SCREEN_HEIGHT;

  const viewBox = `${minX - offset} ${minY - offset} ${maxX - minX + 2 * offset} ${maxY - minY + 2 * offset}`;
  // myConsole.log("viewBox trimmed", viewBox);
  return viewBox;
};

export const scalePoints = (
  points: PointType[],
  scaleFactorX: number,
  scaleFactorY: number,
  focalPoint: PointType,
) => {
  return points.map((point) => {
    // Translate so the focal point is at the origin
    const translatedX = point.x - focalPoint.x;
    const translatedY = point.y - focalPoint.y;

    // Scale
    const scaledX = translatedX * scaleFactorX;
    const scaledY = translatedY * scaleFactorY;

    // Translate back
    const finalX = scaledX + focalPoint.x;
    const finalY = scaledY + focalPoint.y;

    return {
      x: precise(finalX),
      y: precise(finalY),
    };
  });
};

export const rotatePoints = (
  points: PointType[],
  radianAngle: number,
  pivot: PointType = { x: 0, y: 0 },
) => {
  return points.map((point) => {
    // Translate point back to origin using a new object to avoid mutating the original
    const translatedPoint = {
      x: point.x - pivot.x,
      y: point.y - pivot.y,
    };

    // Rotate point
    const xnew =
      translatedPoint.x * Math.cos(radianAngle) -
      translatedPoint.y * Math.sin(radianAngle);
    const ynew =
      translatedPoint.x * Math.sin(radianAngle) +
      translatedPoint.y * Math.cos(radianAngle);

    // Translate point back and return a new object
    return {
      x: xnew + pivot.x,
      y: ynew + pivot.y,
    };
  });
};

export const flipPoints = (
  points: PointType[],
  flipX: boolean,
  flipY: boolean,
) => {
  // Calculate the object's center
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const pivot = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

  // Flip the points around the pivot
  return points.map((point) => {
    const x = flipX ? pivot.x - (point.x - pivot.x) : point.x;
    const y = flipY ? pivot.y - (point.y - pivot.y) : point.y;
    return { x, y };
  });
};

/**
 * Compares two JSON arrays and returns the difference between them as a string.
 * @param json1 - The first JSON array.
 * @param json2 - The second JSON array.
 * @returns The difference between the two JSON arrays as a string.
 */
export const jsonDeepCompare = (json1: any, json2: any, log = false) => {
  const stringDifference = (a: string, b: string) => {
    const set = new Set([...a, ...b]);
    const diff = [...set]
      .filter((char) => !a.includes(char) || !b.includes(char))
      .join("");
    if (log) {
      myConsole.log("Difference", diff);
    }
    return diff === "";
  };
  const aJson = JSON.stringify(json1);
  const bJson = JSON.stringify(json2);
  if (bJson === aJson || json2 === json1) return "";
  return stringDifference(aJson.trim(), bJson.trim());
};

export function parseMyPathData(myPathData: any, update_updatedAt = false) {
  const isValid = (val: any) =>
    val !== null && val !== undefined && (val || val === false);

  ///check if myPathData has pathData and if not set default values
  if (!isValid(myPathData.pathData) && !Array.isArray(myPathData.pathData)) {
    myPathData.pathData = [];
  }

  // filter out invalid path string
  myPathData.pathData = myPathData.pathData.filter((pathData: any) => {
    if (!isValid(pathData.type)) {
      pathData.type = "d";
    }

    if (pathData.type === "d") {
      return isValidPath(pathData.path);
    }
    if (pathData.type === "image") {
      return isValid(pathData.guid);
    }
  });

  //check if pathData is of type PathDataType else set default values
  myPathData.pathData = myPathData.pathData.map((pathData: any) => {
    if (!isValid(pathData.stroke)) {
      pathData.stroke = "#120e31";
    }
    if (!isValid(pathData.strokeWidth)) {
      pathData.strokeWidth = 2;
    }
    if (!isValid(pathData.length)) {
      pathData.length = 0;
    }
    if (!isValid(pathData.time)) {
      pathData.time = 0;
    }
    if (!isValid(pathData.visible)) {
      pathData.visible = false;
    }
    if (!isValid(pathData.guid) || pathData.guid === "") {
      pathData.guid = Crypto.randomUUID();
    }

    // we don't want to save dashArray & dashArrayOffset, WHY NOT??
    pathData.strokeDasharray = undefined;
    pathData.strokeDashoffset = undefined;
    // we want all path to be unselected when saved and when loaded
    // SELECTED IS GOING TO BE EXCEPTION SHOULD BE TRACKED SEPARATELY, IF SO...
    // lets forget about this here and only remember to reset during file loading
    // pathData.selected = false; // This will unselect each time path is saved though, which we dont want..
    return pathData;
  });

  // check if myPathData has metaData and if not set default values
  myPathData.metaData = myPathData.metaData || {};
  if (!isValid(myPathData.metaData.guid)) {
    myPathData.metaData.guid = Crypto.randomUUID();
  }
  if (!isValid(myPathData.metaData.created_at)) {
    myPathData.metaData.created_at = new Date().toISOString();
  }
  if (!isValid(myPathData.metaData.updatedAt) || update_updatedAt) {
    myPathData.metaData.updatedAt = new Date().toISOString();
  }
  if (
    !isValid(myPathData.metaData.name) ||
    myPathData.metaData.name === myPathData.metaData.guid
  ) {
    // Assuming myPathData.metaData.updatedAt is already set to the UTC timestamp
    const utcDate = new Date(myPathData.metaData.updatedAt);
    const localDate = new Date(
      utcDate.getTime() - utcDate.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .split(".")[0]
      .replace("T", " ");
    myPathData.metaData.name = localDate;
  }

  if (!isValid(myPathData.metaData.viewBox)) {
    myPathData.metaData.viewBox = CANVAS_VIEWBOX;
  }
  if (!isValid(myPathData.metaData.viewBoxTrimmed)) {
    myPathData.metaData.viewBoxTrimmed = getViewBoxTrimmed(myPathData.pathData);
  }
  return myPathData;
}

export const getDeviceOrientation = () => {
  return new Promise((resolve) => {
    const subscription = Accelerometer.addListener(({ x, y }) => {
      subscription.remove();
      if (Math.abs(x) > Math.abs(y)) {
        // Landscape mode
        resolve(x >= 0 ? Orientation.LANDSCAPE_UP : Orientation.LANDSCAPE_DOWN);
      } else {
        // Portrait mode
        resolve(y >= 0 ? Orientation.PORTRAIT_UP : Orientation.PORTRAIT_DOWN);
      }
    });
  });
};

export const getPenOffsetFactor = async (
  deviceOrientation?: OrientationType | undefined,
) => {
  try {
    const orientation = deviceOrientation ?? (await getDeviceOrientation());
    // myConsole.log('Device orientation', orientation);
    let factorX = 1;
    let factorY = 1;
    switch (orientation) {
      case Orientation.PORTRAIT_UP:
        factorX = -1;
        factorY = -1;
        break;
      case Orientation.PORTRAIT_DOWN:
        factorX = 1;
        factorY = 1;
        break;
      case Orientation.LANDSCAPE_UP:
        factorX = 1;
        factorY = -1;
        break;
      case Orientation.LANDSCAPE_DOWN:
        factorX = -1;
        factorY = 1;
        break;
    }

    factorX = I_AM_ANDROID ? factorX : -1 * factorX;
    factorY = I_AM_ANDROID ? factorY : -1 * factorY;

    // const adjX = factorX * Math.abs(penOffset.x);
    // const adjY = factorY * Math.abs(penOffset.y);
    // myConsole.log(orientation, penOffset);
    return { x: factorX, y: factorY };
  } catch (error) {
    myConsole.log("Error getting device orientation", error);
  } finally {
    // myConsole.log('Device orientation check complete', penOffset);
  }
};

export const hrFormatSize = (bytes: number) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))), 10);
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`;
};

export const hrFormatTime = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  const ms = milliseconds % 1000;
  const min = Math.floor(seconds / 60);
  const s = seconds % 60;

  let result = '';
  if (min > 0) result += `${min} min `;
  if (s > 0) result += `${s} sec `;
  if (ms > 0) result += `${precise(ms,0)} ms`;

  return result.trim();
};
