import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Dimensions, Platform } from "react-native";
import { Linecap, Linejoin } from "react-native-svg";
import * as Crypto from "expo-crypto";
import { CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_VIEWBOX, PRECISION, PointType, ScreenModes, TransitionType, ModalAnimations } from "./types";
import { PathDataType, SvgDataType } from "./types";
import { polygonContains } from "d3";

// TODO move this to constants
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export const isAndroid = Platform.OS === "android";
export const isIOS = Platform.OS === "ios";


export const createSvgData = (): SvgDataType => ({
  pathData: [],
  metaData: {
    guid: "",
    created_at: Date.now().toString(),
    updated_at: Date.now().toString(),
    name: "",
    viewBox: `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`,
    lastScreenMode: ScreenModes[0].name,
    editable: true,
    animation: {
      speed: 1,
      loop: true,
      delay: 0,
      transition: 0,
      transitionType: TransitionType.Fade,
      correction: 0.05,
    }
  },
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
  path: "",
  stroke: stroke ?? "#000000",
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

export const precise = (num: string | number, precision = PRECISION): number =>
  parseFloat(parseFloat(num as string).toFixed(precision));

export const isValidPath = (path: string): boolean => {
  if (path === undefined || path === null) return false;
  if (path === "") return false;
  let p = path.toUpperCase();
  if (p === "M" || p === "MZ") return false;
  // add any other issue that may happen with path
  return true;
}

export const getPathFromPoints = (points: PointType[]) => {
  // check if its a closed path
  const isClosed = points[0].x === points[points.length - 1].x && points[0].y === points[points.length - 1].y;
  // remove the last point if its a closed path
  if (isClosed) {
    points = points.slice(0, -1);
  }
  let path = points.map(({ x, y }) => `L${precise(x as unknown as string)},${precise(y as unknown as string)}`).join("");
  // attach M at front
  path = `M${path.slice(1)}`;
  // attach Z at end if its a closed path
  if (isClosed) {
    path = `${path}Z`;
  }
  return path;
};

export const getPointsFromPath = (path: string): PointType[] => {
  path = path.trim().toUpperCase();
  // is command closed
  const isClosed = path[path.length - 1] === "Z";
  // remove Z command
  path = isClosed ? path.slice(0, -1) : path;
  const commands = path.split(/(?=[MLC])/); // Split on M, L, or C
  const points = commands.map((command) => {
    const type = command[0];
    const coords = command.slice(1).split(",").map(Number);
    if (type === "C") {
      // For C commands, return the last pair of coordinates
      return { x: coords[4], y: coords[5] };
    } else {
      // For M and L commands, return the coordinates
      return { x: coords[0], y: coords[1] };
    }
  });
  // Add the first point to the end of the array if the path is closed
  if (isClosed) {
    points.push(points[0]);
  }
  return points;
}



export const pathContainsPoint = (path: string, checkPoint: PointType) => {
  const points = getPointsFromPath(path);
  const d3Points = points.map((point) => [point.x, point.y] as [number, number]);
  return polygonContains(d3Points, [checkPoint.x, checkPoint.y]);
}

// if given path is atleast half inside canvas
export const isShapeInsideCanvas = (path: string) => {
  const points = getPointsFromPath(path);
  const d3Points = points.map((point) => [point.x, point.y] as [number, number]);
  let count = 0;
  d3Points.forEach((point) => {
    if (point[0] >= 0 && point[0] <= CANVAS_WIDTH && point[1] >= 0 && point[1] <= CANVAS_HEIGHT) {
      count++;
    }
  });
  return count >= d3Points.length * 0.25;
}

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

export const getViewBoxTrimmed = (pathData: PathDataType[], offset=20) => {
  let minX = CANVAS_WIDTH ?? screenWidth;
  let minY = CANVAS_HEIGHT ?? screenHeight;
  let maxX = 0;
  let maxY = 0;
  // let offset = 20;

  // console.log("pathData", pathData)
  pathData.forEach((path) => {
    // console.log("path", path)
    const points = getPointsFromPath(path.path);
    // console.log("points", points);
    points.forEach((point) => {
      if (point.x === undefined || point.y === undefined) {
        // console.log("point.x or point.y is undefined", point);
        return;
      }
      if (Number.isNaN(point.x) || Number.isNaN(point.y)) {
        // console.log("point.x or point.y is NaN", point);
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
  maxX = r(maxX) ?? CANVAS_WIDTH ?? screenWidth;
  maxY = r(maxY) ?? CANVAS_HEIGHT ?? screenHeight;

  const viewBox = `${minX - offset} ${minY - offset} ${maxX - minX + 2 * offset} ${maxY - minY + 2 * offset}`;
  // console.log("viewBox trimmed", viewBox);
  return viewBox;
};

export const scalePoints = (points:PointType[], scaleFactor: number) => {
  return points.map((point) => {
    return {
      x: point.x * scaleFactor,
      y: point.y * scaleFactor,
    };
  });
}

export const rotatePoints = (points: PointType[], radianAngle: number, pivot:PointType = {x:0, y: 0}) => {
  return points.map((point) => {
    // Translate point back to origin
    point.x -= pivot.x;
    point.y -= pivot.y;

    // Rotate point
    const xnew = point.x * Math.cos(radianAngle) - point.y * Math.sin(radianAngle);
    const ynew = point.x * Math.sin(radianAngle) + point.y * Math.cos(radianAngle);

    // Translate point back
    const rotatedPoint = {
      x: xnew + pivot.x,
      y: ynew + pivot.y,
    };

    return rotatedPoint;
  });
}


/**
 * Compares two JSON arrays and returns the difference between them as a string.
 * @param json1 - The first JSON array.
 * @param json2 - The second JSON array.
 * @returns The difference between the two JSON arrays as a string.
 */
export const jsonDeepCompare = (json1: any, json2: any, log = false) => {
  const stringDifference = (a: string, b: string) => {
    const set = new Set([...a, ...b]);
    const diff = [...set].filter((char) => !a.includes(char) || !b.includes(char)).join("");
    if(log) {
      console.log("Difference", diff);
    }
    return diff === "";
  }
  const aJson = JSON.stringify(json1);
  const bJson = JSON.stringify(json2);
  if (bJson === aJson || json2 === json1) return "";
  return stringDifference(aJson.trim(), bJson.trim());
}


export function parseSvgData(svgData: any, update_updated_at = false): SvgDataType {
  const isValid = (val: any) => (val !== null && val !== undefined && (val || val === false));

  ///check if svgData has pathData and if not set default values
  if (!isValid(svgData.pathData) && !Array.isArray(svgData.pathData)) {
      svgData.pathData = [];
  }

  // filter out invalid path string
  svgData.pathData = svgData.pathData.filter((pathData: any) => {
      return isValidPath(pathData.path);
  });

  //check if pathData is of type PathDataType else set default values
  svgData.pathData = svgData.pathData.map((pathData: any) => {
      if (!isValid(pathData.stroke)) {
          pathData.stroke = "#000000";
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


  // check if svgData has metaData and if not set default values
  svgData.metaData = svgData.metaData || {};
  if (!isValid(svgData.metaData.guid)) {
      svgData.metaData.guid = Crypto.randomUUID();
  }
  if (!isValid(svgData.metaData.created_at)) {
      svgData.metaData.created_at = new Date().toISOString();
  }
  if (!isValid(svgData.metaData.updated_at) || update_updated_at) {
      svgData.metaData.updated_at = new Date().toISOString();
  }
  if (!isValid(svgData.metaData.name) || svgData.metaData.name === svgData.metaData.guid) {
      svgData.metaData.name = svgData.metaData.updated_at.split('.')[0].split('T').join(' ');
  }
  if (!isValid(svgData.metaData.viewBox)) {
      svgData.metaData.viewBox = CANVAS_VIEWBOX;
  }
  if (!isValid(svgData.metaData.viewBoxTrimmed)) {
      svgData.metaData.viewBoxTrimmed = getViewBoxTrimmed(svgData.pathData);
  }
  return svgData;
}


export function pickTwoAnimations(): [string, string] {
  const index1 = Math.floor(Math.random() * ModalAnimations.length);
  let index2 = Math.floor(Math.random() * ModalAnimations.length);

  // Ensure we get two different animations
  while (index1 === index2) {
    index2 = Math.floor(Math.random() * ModalAnimations.length);
  }

  return [ModalAnimations[index1], ModalAnimations[index2]];
}

