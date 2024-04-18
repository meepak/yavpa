import { type Linecap, type Linejoin } from "react-native-svg";
import * as Crypto from "expo-crypto";
import { polygonContains, polygonLength, line, curveBasis } from "d3-polygon";
import { Accelerometer } from "expo-sensors";
import simplify from "simplify-js";
import myConsole from "@c/controls/pure/my-console-log";
import { CANVAS_HEIGHT, CANVAS_WIDTH, MetaDataType } from "./types";
import {
  I_AM_ANDROID,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_SIMPLIFY_TOLERANCE,
  PRECISION,
  type PointType,
  type PathDataType,
  type MyPathDataType,
  type OrientationType,
  Orientation,
  ScreenModes,
  TransitionType,
  type ImageDataType,
  SNAPPING_TOLERANCE,
  MY_ON_PRIMARY_COLOR_OPTIONS,
} from "./types";

export function getMyOnPrimaryColor() {
  const randomIndex = Math.floor(
    Math.random() * MY_ON_PRIMARY_COLOR_OPTIONS.length,
  );
  return MY_ON_PRIMARY_COLOR_OPTIONS[randomIndex];
}

export const createMyPathData = (): MyPathDataType => ({
  pathData: [],
  imageData: [],
  metaData: {
    guid: "",
    created_at: Date.now().toString(),
    updatedAt: Date.now().toString(),
    name: "",
    // viewBox: `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`,
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
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    canvasScale: 1,
    canvasTranslateX: 0,
    canvasTranslateY: 0,
  },
  updatedAt: new Date().toString(),
});

// Not used but keeping for reference
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
  strokeWidth: strokeWidth ?? DEFAULT_STROKE_WIDTH,
  strokeOpacity: strokeOpacity ?? DEFAULT_STROKE_OPACITY,
  strokeCap: strokeCap ?? "round", // Other support in next version only
  strokeJoin: strokeJoin ?? "round",
  fill: strokeFill ?? "none",
  strokeDasharray: strokeDasharray ?? undefined,
  strokeDashoffset: strokeDashoffset ?? undefined,
  length: 0,
  time: 0,
  visible: false,
  guid: "", // Without guid it's not a valid path though
  selected: false,
});

export const createImageData = (
  guid: string,
  data: string,
  width: number,
  height: number,
): ImageDataType => ({
  type: "image",
  guid,
  data,
  width,
  height,
  x: 0,
  y: 0,
  visible: false,
  rotation: 0,
  scale: 1,
  opacity: 1,
  selected: false,
});

export const precise = (
  number_: string | number,
  precision = PRECISION,
): number =>
  Number.parseFloat(Number.parseFloat(number_ as string).toFixed(precision));

export const isValidPath = (path: string): boolean => {
  if (path === undefined || path === null) {
    return false;
  }

  if (path === "") {
    return false;
  }

  const p = path.toUpperCase();
  if (p === "M" || p === "MZ") {
    return false;
  }

  // Add any other issue that may happen with path
  if (path.includes("NaN")) {
    return false;
  }

  return true;
};

export const calculateDistance = (point1: PointType, point2: PointType) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const distance = Math.hypot(dx, dy);
  // MyConsole.log("distance", distance, point1, point2);
  return distance;
};

export const getRealPathFromPoints = (points: PointType[]) => {
  if (!points || points.length === 0) {
    return "";
  }

  const lineGenerator = line<PointType>()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(curveBasis); // Use curveBasis for a smooth curve

  return lineGenerator(points) || "";
};

export const getPathFromPoints = (points: PointType[]) => {
  if (!points || points.length === 0) {
    return "";
  }

  const isClosed =
    points[0]?.x === points.at(-1)?.x && points[0]?.y === points.at(-1)?.y;
  let path = points
    .map(({ x, y }, index) => {
      if (isClosed && index === points.length - 1) {
        return "";
      }

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
// TODO APPLY CACHING MECHANISM ON THIS
export const getPointsFromPath = (
  path: string,
  resolution = 100,
  simplifyTolerance: number = DEFAULT_SIMPLIFY_TOLERANCE,
): PointType[] => {
  if (typeof path !== "string") {
    return [];
  }

  if (path === "") {
    return [];
  }

  path = path.trim();

  const isClosed = path.endsWith("Z");

  const commands = path.split(/(?=[mlcz])/i);
  let firstPoint: PointType | undefined = undefined;
  let previousPoint: PointType | undefined = undefined;
  const points: PointType[] = [];
  for (const command of commands) {
    const type = command[0].toUpperCase();
    const coords = command.slice(1).split(",").map(Number);
    let point: PointType | undefined = undefined;
    switch (type) {
      case "C": {
        for (let t = 0; t <= resolution; t++) {
          const s = t / resolution;
          const x =
            (1 - s) ** 3 * (previousPoint?.x || 0) +
            3 * (1 - s) ** 2 * s * coords[0] +
            3 * (1 - s) * s ** 2 * coords[2] +
            s ** 3 * coords[4];
          const y =
            (1 - s) ** 3 * (previousPoint?.y || 0) +
            3 * (1 - s) ** 2 * s * coords[1] +
            3 * (1 - s) * s ** 2 * coords[3] +
            s ** 3 * coords[5];
          points.push({ x, y });
        }

        point = { x: coords[4], y: coords[5] };
        break;
      }

      case "M":
      case "L": {
        const lastPoint = points.at(-1);
        if (lastPoint) {
          const distance = Math.hypot(
            coords[0] - lastPoint.x,
            coords[1] - lastPoint.y,
          );
          if (distance > resolution) {
            const numberOfPoints = Math.floor(distance / resolution);
            for (let i = 0; i < numberOfPoints; i++) {
              const t = i / numberOfPoints;
              const x = lastPoint.x + (coords[0] - lastPoint.x) * t;
              const y = lastPoint.y + (coords[1] - lastPoint.y) * t;
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
      }

      default: {
        point = undefined;
      }
    }

    previousPoint = point;
  }

  // MyConsole.log(points.length, "Points");

  // simplify cPoints to reduce number of points
  const simplifiedPoints =
    points.length > 10 ? simplify(points, simplifyTolerance) : points;

  // MyConsole.log(simplifiedPoints.length, "simplifiedPoints");

  if (isClosed) {
    simplifiedPoints.push({
      x: simplifiedPoints[0].x,
      y: simplifiedPoints[0].y,
    });
  }

  return simplifiedPoints;
};

export const getLastPoint = (path: string) => {
  // Split function to use a regular expression that splits the string
  // at the position before any SVG command letter.
  const commands = path.trim().split(/(?=[MmLlHhVvCcSsQqTtAaZz])/);
  const lastCommand = commands.at(-1);
  const commandType = lastCommand?.[0]?.toUpperCase();
  const parameters = lastCommand?.slice(1)?.split(",");
  const x = parameters?.at(-2) ?? "0";
  const y = parameters?.at(-1) ?? "0";

  return { commandType, x: precise(x), y: precise(y) };
};

export const replaceLastPoint = (path: string, lastPoint: PointType) => {
  const commands = path.trim().split(/(?=[MmLlHhVvCcSsQqTtAaZz])/);
  commands[commands.length - 1] =
    (commands.at(-1)?.[0] ?? "") + lastPoint.x + "," + lastPoint.y;
  return commands.join("");
};

export const getFirstAndLastPointsFromPath = (path: string) => {
  const commands = path.split("L");

  const firstCommand = commands[0];
  const lastCommand = commands.at(-1);

  const firstPoint = firstCommand.slice(1).split(",").map(Number);
  const lastPoint = lastCommand?.split(",").map(Number) ?? [];

  return {
    firstPoint: { x: firstPoint[0], y: firstPoint[1] },
    lastPoint: { x: lastPoint[0], y: lastPoint[1] },
  };
};

// Return first point, points at 25%, 50%, 75% and last point
// without using getPointsFromPath
export const get5PointsFromPath = (path: string): PointType[] => {
  const commands = path.split(/(?=[LC])/);
  const indices = [
    0,
    Math.floor(commands.length / 4),
    Math.floor(commands.length / 2),
    Math.floor((commands.length * 3) / 4),
    commands.length - 1,
  ];

  return indices.map((index) => {
    const command = commands[index];
    const [x, y] = command.slice(1).split(",").map(Number); // Slice to remove the command letter
    return { x, y };
  });
};

export const getPathLength = (points: PointType[]): number =>
  polygonLength(points.map((point) => [point.x, point.y]));

export const getSnappingPoint = (
  paths: PathDataType[],
  screenPoint: PointType,
  canvasScale: number,
  canvasTranslate: PointType,
) => {
  // Lets first try first and last point of each path and see if it is within the range
  // if yes, then snap to that point
  // if no, then snap to the nearest point on the path

  const snappingTolerance = SNAPPING_TOLERANCE * canvasScale;
  const currentPoint = {
    x: screenPoint.x * canvasScale + canvasTranslate.x,
    y: screenPoint.y * canvasScale + canvasTranslate.y,
  };
  let snapPointFound = false;
  for (const path of paths) {
    // Console.log('path', path.guid);
    // we just want first and last point, lets not complicate with getPointsFromPath
    const { firstPoint, lastPoint } = getFirstAndLastPointsFromPath(path.path);
    if (currentPoint) {
      const distanceFromFirst = calculateDistance(firstPoint, currentPoint);
      // Console.log('distanceFromFirst', distanceFromFirst, tolerance, firstPoint, currentPointRef.current);
      if (distanceFromFirst <= snappingTolerance) {
        currentPoint.x = firstPoint.x;
        currentPoint.y = firstPoint.y;
        snapPointFound = true;
        continue;
      }

      const distanceFromLast = calculateDistance(lastPoint, currentPoint);
      // Console.log('distanceFromLast', distanceFromLast, tolerance, lastPoint, currentPointRef.current);
      if (distanceFromLast <= snappingTolerance) {
        currentPoint.x = lastPoint.x;
        currentPoint.y = lastPoint.y;
        snapPointFound = true;
        continue;
      }
    }
  }

  if (snapPointFound) {
    console.log("snap point found", currentPoint);
  } else {
    // TODO FIND SNAP POINT WITHIN PATH
    // lets find the nearest point on the path
    // paths.forEach((path) => {
    //   if (currentPointRef.current) {
    //     const pathPoints = getPointsFromPath(path.path);
    //     const nearestPoint = pathPoints.reduce((prev, current) => {
    //       if (currentPointRef.current) {
    //         const distanceFromCurrent = calculateDistance({ x: current[0], y: current[1] }, currentPointRef.current);
    //         const distanceFromPrev = calculateDistance({ x: prev[0], y: prev[1] }, currentPointRef.current);
    //         return distanceFromCurrent < distanceFromPrev ? current : prev;
    //       }
    //     });
    //     const distance = calculateDistance(nearestPoint, currentPointRef.current);
    //     if (distance <= tolerance) {
    //       currentPointRef.current.x = nearestPoint[0];
    //       currentPointRef.current.y = nearestPoint[1];
    //       snapPointFound = true;
    //       return;
    //     }
    //   }
    // });
    console.log("snap point not found", currentPoint);
  }

  return currentPoint;
};

export const pathContainsPoint = (path: string, checkPoint: PointType) => {
  const points = getPointsFromPath(path);
  const d3Points = points.map(
    (point) => [point.x, point.y] as [number, number],
  );
  return polygonContains(d3Points, [checkPoint.x, checkPoint.y]);
};

// If given path is atleast half inside canvas
export const isShapeInsideCanvas = (path: string) => {
  const points = getPointsFromPath(path);
  const d3Points = points.map(
    (point) => [point.x, point.y] as [number, number],
  );
  let count = 0;
  for (const point of d3Points) {
    if (
      point[0] >= 0 &&
      point[0] <= CANVAS_WIDTH &&
      point[1] >= 0 &&
      point[1] <= CANVAS_HEIGHT
    ) {
      count++;
    }
  }

  return count >= d3Points.length * 0.25;
};

const SLOPE_TOLERANCE = 0.5; // Replace XX with the tolerance value you want to use

export const isLineMeantToBeStraight = (points) => {
  // Calculate the slopes of the line segments between each pair of consecutive points
  const segmentSlopes: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const slope =
      (points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x);
    segmentSlopes.push(slope);
  }

  // Calculate the average of the segment slopes
  const averageSegmentSlope =
    segmentSlopes.reduce((a, b) => a + b, 0) / segmentSlopes.length;

  // Calculate the standard deviation of the segment slopes
  const squareDiffs = segmentSlopes.map(
    (slope) => (slope - averageSegmentSlope) ** 2,
  );
  const avgSquareDiff =
    squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  const standardDeviation = Math.sqrt(avgSquareDiff);

  // If the standard deviation is within the tolerance, the line is meant to be straight
  console.log("stdev", standardDeviation);
  return standardDeviation <= SLOPE_TOLERANCE;
};

const countOfPointsOfPath1InsidePath2 = (
  path1: string,
  path2: string,
  maximumPoints = -1,
) => {
  const points = getPointsFromPath(path1);
  const d3Points = points.map(
    (point) => [point.x, point.y] as [number, number],
  );
  const path2Points = getPointsFromPath(path2);
  const d3Path2Points = path2Points.map(
    (point) => [point.x, point.y] as [number, number],
  );
  const insidePoints: any[] = [];
  for (const point of d3Points) {
    if (polygonContains(d3Path2Points, point)) {
      insidePoints.push(point);
      if (maximumPoints > 0 && insidePoints.length >= maximumPoints) {
        ({
          path1AllD3Points: d3Points,
          path1InsideD3Points: insidePoints,
        });
        continue;
      }
    }
  }

  return { path1AllD3Points: d3Points, path1InsideD3Points: insidePoints };
};

export const isPath1InsidePath2 = (path1: string, path2: string) => {
  const { path1AllD3Points, path1InsideD3Points } =
    countOfPointsOfPath1InsidePath2(path1, path2);
  return path1InsideD3Points.length >= path1AllD3Points.length * 0.25;
};

export const doPathIntersect = (path1: string, path2: string) => {
  const { path1InsideD3Points } = countOfPointsOfPath1InsidePath2(
    path1,
    path2,
    1,
  );
  return path1InsideD3Points.length > 0;
};

export const getViewBoxTrimmed = (pathData: PathDataType[], offset = 0) => {
  let minX = CANVAS_WIDTH;
  let minY = CANVAS_HEIGHT;
  let maxX = 0;
  let maxY = 0;
  // Let offset = 20;

  //
  if (pathData.length === 0) {
    return `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`;
  }

  // MyConsole.log("pathData", pathData)
  for (const path of pathData) {
    // MyConsole.log("path", path)
    const points = getPointsFromPath(path.path);
    // MyConsole.log("points", points);
    for (const point of points) {
      if (point.x === undefined || point.y === undefined) {
        // MyConsole.log("point.x or point.y is undefined", point);
        continue;
      }

      if (Number.isNaN(point.x) || Number.isNaN(point.y)) {
        // MyConsole.log("point.x or point.y is NaN", point);
        continue;
      }

      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }

  const r = (value) => Math.round(value);
  minX = r(minX) ?? 0;
  minY = r(minY) ?? 0;
  maxX = r(maxX) ?? CANVAS_WIDTH ?? SCREEN_WIDTH;
  maxY = r(maxY) ?? CANVAS_HEIGHT ?? SCREEN_HEIGHT;

  const viewBox = `${minX - offset} ${minY - offset} ${maxX - minX + 2 * offset} ${maxY - minY + 2 * offset}`;
  // MyConsole.log("viewBox trimmed", viewBox);
  return viewBox;
};

export const getViewBox = (metaData: MetaDataType) => {
  return (metaData.canvasTranslateX || 0) +
          " " +
          (metaData.canvasTranslateY || 0) +
          " " +
          (metaData.canvasWidth || CANVAS_WIDTH) * (metaData.canvasScale || 1) +
          " " +
          (metaData.canvasHeight || CANVAS_HEIGHT) * (metaData.canvasScale || 1);

}

// This gives pure boundary box path data
// without scaling and translation
export const getBoundaryBox = (
  selectedPaths: PathDataType[],
): PathDataType | undefined => {
  if (selectedPaths.length === 0) {
    return;
  }

  let maxStrokeWidth = 0;
  for (const item of selectedPaths) {
    if (item.strokeWidth > maxStrokeWidth) {
      maxStrokeWidth = item.strokeWidth;
    }
  }

  const offset = maxStrokeWidth / 2 + 2;
  const vbbox = getViewBoxTrimmed(selectedPaths, offset);
  const vbbPoints = vbbox.split(" ");

  const start = {
    x: Number.parseFloat(vbbPoints[0]),
    y: Number.parseFloat(vbbPoints[1]),
  };
  const end = {
    x: Number.parseFloat(vbbPoints[0]) + Number.parseFloat(vbbPoints[2]),
    y: Number.parseFloat(vbbPoints[1]) + Number.parseFloat(vbbPoints[3]),
  };

  const path = `M${start.x},${start.y} L${end.x},${start.y} L${end.x},${end.y} L${start.x},${end.y} Z`;
  const rectPathData = createPathdata("#fdf9b4", 2); // Stroke, width, opacity
  rectPathData.visible = true;
  rectPathData.path = path;
  rectPathData.strokeDasharray = "7,7";
  rectPathData.strokeDashoffset = 4;
  return rectPathData;
};

export const scalePoints = (
  points: PointType[],
  scaleFactorX: number,
  scaleFactorY: number,
  focalPoint: PointType,
) =>
  points.map((point) => {
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

export const rotatePoints = (
  points: PointType[],
  radianAngle: number,
  pivot: PointType = { x: 0, y: 0 },
) =>
  points.map((point) => {
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
  if (bJson === aJson || json2 === json1) {
    return "";
  }

  return stringDifference(aJson.trim(), bJson.trim());
};

export function parseMyPathData(myPathData: any, update_updatedAt = false) {
  const isValid = (value: any) =>
    value !== null && value !== undefined && (value || value === false);

  /// check if myPathData has pathData and if not set default values
  if (!isValid(myPathData.pathData) && !Array.isArray(myPathData.pathData)) {
    myPathData.pathData = [];
  }

  // Filter out invalid path string
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

  // Check if pathData is of type PathDataType else set default values
  myPathData.pathData = myPathData.pathData.map((pathData: any) => {
    if (!isValid(pathData.stroke)) {
      pathData.stroke = "#120e31";
    }

    if (!isValid(pathData.strokeWidth)) {
      pathData.strokeWidth = DEFAULT_STROKE_WIDTH;
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

    // We don't want to save dashArray & dashArrayOffset, WHY NOT??
    pathData.strokeDasharray = undefined;
    pathData.strokeDashoffset = undefined;
    // We want all path to be unselected when saved and when loaded
    // SELECTED IS GOING TO BE EXCEPTION SHOULD BE TRACKED SEPARATELY, IF SO...
    // lets forget about this here and only remember to reset during file loading
    // pathData.selected = false; // This will unselect each time path is saved though, which we dont want..
    return pathData;
  });
  
  // Check if myPathData has metaData and if not set default values
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
      utcDate.getTime() - utcDate.getTimezoneOffset() * 60_000,
    )
      .toISOString()
      .split(".")[0]
      .replace("T", " ");
    myPathData.metaData.name = localDate;
  }

  if (
    !isValid(myPathData.metaData.canvasWidth) ||
    myPathData.metaData.canvasWidth === 0
  ) {
    myPathData.metaData.canvasWidth = CANVAS_WIDTH;
  }

  if (
    !isValid(myPathData.metaData.canvasHeight) ||
    myPathData.metaData.canvasHeight === 0
  ) {
    myPathData.metaData.canvasHeight = CANVAS_HEIGHT;
  }

  if (!isValid(myPathData.metaData.canvasScale)) {
    myPathData.metaData.canvasScale = 1;
  }

  if (!isValid(myPathData.metaData.canvasTranslateX)) {
    myPathData.metaData.canvasTranslateX = 0;
  }

  if (!isValid(myPathData.metaData.canvasTranslateY)) {
    myPathData.metaData.canvasTranslateY = 0;
  }

  return myPathData;
}

export const getDeviceOrientation = async () =>
  new Promise((resolve) => {
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

export const getPenOffsetFactor = async (
  deviceOrientation?: OrientationType | undefined,
) => {
  try {
    const orientation = deviceOrientation ?? (await getDeviceOrientation());
    // MyConsole.log('Device orientation', orientation);
    let factorX = 1;
    let factorY = 1;
    switch (orientation) {
      case Orientation.PORTRAIT_UP: {
        factorX = -1;
        factorY = -1;
        break;
      }

      case Orientation.PORTRAIT_DOWN: {
        factorX = 1;
        factorY = 1;
        break;
      }

      case Orientation.LANDSCAPE_UP: {
        factorX = 1;
        factorY = -1;
        break;
      }

      case Orientation.LANDSCAPE_DOWN: {
        factorX = -1;
        factorY = 1;
        break;
      }
    }

    factorX = I_AM_ANDROID ? factorX : -1 * factorX;
    factorY = I_AM_ANDROID ? factorY : -1 * factorY;

    // Const adjX = factorX * Math.abs(penOffset.x);
    // const adjY = factorY * Math.abs(penOffset.y);
    // myConsole.log(orientation, penOffset);
    return { x: factorX, y: factorY };
  } catch (error) {
    myConsole.log("Error getting device orientation", error);
  } finally {
    // MyConsole.log('Device orientation check complete', penOffset);
  }
};

export const hrFormatSize = (bytes: number) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) {
    return "0 Byte";
  }

  const i = Number.parseInt(
    String(Math.floor(Math.log(bytes) / Math.log(1024))),
    10,
  );
  return `${Math.round(bytes / 1024 ** i)} ${sizes[i]}`;
};

export const hrFormatTime = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  const ms = milliseconds % 1000;
  const min = Math.floor(seconds / 60);
  const s = seconds % 60;

  let result = "";
  if (min > 0) {
    result += `${min} min `;
  }

  if (s > 0) {
    result += `${s} sec `;
  }

  if (ms > 0) {
    result += `${precise(ms, 0)} ms`;
  }

  return result.trim();
};

export const arraysEqual = (a: any[], b: any[]) => {
  return a.length === b.length && a.every((val, index) => val === b[index]);
};
