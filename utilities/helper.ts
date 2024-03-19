import { Linecap, Linejoin } from "react-native-svg";
import * as Crypto from "expo-crypto";
import { CANVAS_HEIGHT, CANVAS_WIDTH, CANVAS_VIEWBOX, PRECISION, PointType, ScreenModes, TransitionType, SCREEN_WIDTH, SCREEN_HEIGHT, Orientation } from "./types";
import { PathDataType, SvgDataType } from "./types";
import { polygonContains, polygonLength } from "d3-polygon";
import path from "path";
import { Accelerometer } from "expo-sensors";
import simplify from "simplify-js";
import { line, curveBasis } from 'd3-shape';

export const createSvgData = (): SvgDataType => ({
  pathData: [],
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

export const precise = (num: string | number, precision = PRECISION): number =>
  parseFloat(parseFloat(num as string).toFixed(precision));

export const isValidPath = (path: string): boolean => {
  if (path === undefined || path === null) return false;
  if (path === "") return false;
  let p = path.toUpperCase();
  if (p === "M" || p === "MZ") return false;
  // add any other issue that may happen with path
  if (path.includes('NaN')) return false;
  return true;
}

export const getRealPathFromPoints = (points: PointType[]) => {
  if (!points || points.length === 0) return "";

  const lineGenerator = line<PointType>()
    .x(d => d.x)
    .y(d => d.y)
    .curve(curveBasis); // Use curveBasis for a smooth curve

  return lineGenerator(points) || '';
}

export const getPathFromPoints = (points: PointType[]) => {
  if(!points || points.length === 0) return "";
  const isClosed = points[0].x === points[points.length - 1].x && points[0].y === points[points.length - 1].y;
  let path = points.map(({ x, y }, index) => {
    if (isClosed && index === points.length - 1) return '';
    return `L${precise(x as unknown as string)},${precise(y as unknown as string)}`;
  }).join("");
  path = `M${path.slice(1)}`;
  if (isClosed) {
    path = `${path}Z`;
  }
  return path;
}

// TODO DEFINE RESOLUTION & TOLERANCE AS USER CONFIG
export const getPointsFromPath = (path: string, resolution: number = 100, simplifyTolerance: number = 0.011): PointType[] => {
  if (typeof path !== "string") { return []; }
  if (path === "") { return []; }
  path = path.trim();
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
        const cPoints:PointType[] = [];
        for (let t = 0; t <= resolution; t++) {
          const s = t / resolution;
          const x = Math.pow(1 - s, 3) * (previousPoint?.x || 0) + 3 * Math.pow(1 - s, 2) * s * coords[0] + 3 * (1 - s) * Math.pow(s, 2) * coords[2] + Math.pow(s, 3) * coords[4];
          const y = Math.pow(1 - s, 3) * (previousPoint?.y || 0) + 3 * Math.pow(1 - s, 2) * s * coords[1] + 3 * (1 - s) * Math.pow(s, 2) * coords[3] + Math.pow(s, 3) * coords[5];
          points.push({ x, y });
        }
        point = { x: coords[4], y: coords[5] };
        break;
      case "M":
      case "L":
        let lastPoint = points[points.length - 1];
        if(lastPoint) {
          let distance = Math.sqrt(Math.pow(coords[0] - lastPoint.x, 2) + Math.pow(coords[1] - lastPoint.y, 2));
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


  // console.log(points.length, "Points");

  //simplify cPoints to reduce number of points
  const simplifiedPoints = simplify(points, simplifyTolerance);

  // console.log(simplifiedPoints.length, "simplifiedPoints");

  return simplifiedPoints;
};


export const getPathLength = (points: PointType[]): number => {
  return polygonLength(points.map(point => [point.x, point.y]))
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

export const isPath1InsidePath2 = (path1: string, path2: string) => {
  const points = getPointsFromPath(path1);
  const d3Points = points.map((point) => [point.x, point.y] as [number, number]);
  const path2Points = getPointsFromPath(path2);
  const d3Path2Points = path2Points.map((point) => [point.x, point.y] as [number, number]);
  let count = 0;
  d3Points.forEach((point) => {
    if (polygonContains(d3Path2Points, point)) {
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

export const getViewBoxTrimmed = (pathData: PathDataType[], offset = 20) => {
  let minX = CANVAS_WIDTH ?? SCREEN_WIDTH;
  let minY = CANVAS_HEIGHT ?? SCREEN_HEIGHT;
  let maxX = 0;
  let maxY = 0;
  // let offset = 20;

  //
  if(pathData.length === 0) return `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`;

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
  maxX = r(maxX) ?? CANVAS_WIDTH ?? SCREEN_WIDTH;
  maxY = r(maxY) ?? CANVAS_HEIGHT ?? SCREEN_HEIGHT;

  const viewBox = `${minX - offset} ${minY - offset} ${maxX - minX + 2 * offset} ${maxY - minY + 2 * offset}`;
  // console.log("viewBox trimmed", viewBox);
  return viewBox;
};

export const scalePoints = (points: PointType[], scaleFactorX: number, scaleFactorY: number, focalPoint: PointType) => {
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
}

export const rotatePoints = (points: PointType[], radianAngle: number, pivot: PointType = { x: 0, y: 0 }) => {
  return points.map((point) => {
    // Translate point back to origin using a new object to avoid mutating the original
    const translatedPoint = {
      x: point.x - pivot.x,
      y: point.y - pivot.y,
    };

    // Rotate point
    const xnew = translatedPoint.x * Math.cos(radianAngle) - translatedPoint.y * Math.sin(radianAngle);
    const ynew = translatedPoint.x * Math.sin(radianAngle) + translatedPoint.y * Math.cos(radianAngle);

    // Translate point back and return a new object
    return {
      x: xnew + pivot.x,
      y: ynew + pivot.y,
    };
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
    const diff = [...set].filter((char) => !a.includes(char) || !b.includes(char)).join("");
    if (log) {
      console.log("Difference", diff);
    }
    return diff === "";
  }
  const aJson = JSON.stringify(json1);
  const bJson = JSON.stringify(json2);
  if (bJson === aJson || json2 === json1) return "";
  return stringDifference(aJson.trim(), bJson.trim());
}


export function parseSvgData(svgData: any, update_updatedAt = false): SvgDataType {
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


  // check if svgData has metaData and if not set default values
  svgData.metaData = svgData.metaData || {};
  if (!isValid(svgData.metaData.guid)) {
    svgData.metaData.guid = Crypto.randomUUID();
  }
  if (!isValid(svgData.metaData.created_at)) {
    svgData.metaData.created_at = new Date().toISOString();
  }
  if (!isValid(svgData.metaData.updatedAt) || update_updatedAt) {
    svgData.metaData.updatedAt = new Date().toISOString();
  }
  if (!isValid(svgData.metaData.name) || svgData.metaData.name === svgData.metaData.guid) {
    svgData.metaData.name = svgData.metaData.updatedAt.split('.')[0].split('T').join(' ');
  }
  if (!isValid(svgData.metaData.viewBox)) {
    svgData.metaData.viewBox = CANVAS_VIEWBOX;
  }
  if (!isValid(svgData.metaData.viewBoxTrimmed)) {
    svgData.metaData.viewBoxTrimmed = getViewBoxTrimmed(svgData.pathData);
  }
  return svgData;
}


export const getDeviceOrientation = () => {
  return new Promise((resolve) => {
    const subscription = Accelerometer.addListener(({ x, y }) => {
      subscription.remove();
      if (Math.abs(x) > Math.abs(y)) {
        // Landscape mode
        resolve(x > 0 ? Orientation.LANDSCAPE_UP : Orientation.LANDSCAPE_DOWN);
      } else {
        // Portrait mode
        resolve(y > 0 ? Orientation.PORTRAIT_UP : Orientation.PORTRAIT_DOWN);
      }
    });
  });
};


// TODO make this user onfigurable for tiny finger people
const penOffset = { x: 30, y: 30 };

export const getPenOffset = async() => {
  try {
    const orientation = await getDeviceOrientation();
    // console.log('Device orientation', orientation);
    let x = Math.abs(penOffset.x);
    let y = Math.abs(penOffset.y);
    switch (orientation) {
      case Orientation.PORTRAIT_UP:
        penOffset.x = -1 * x; penOffset.y = -1 * y;
        break;
      case Orientation.PORTRAIT_DOWN:
        penOffset.x = 1 * x; penOffset.y = 1 * y;
        break;
      case Orientation.LANDSCAPE_UP:
        penOffset.x = 1 * x; penOffset.y = -1 * y;
        break;
      case Orientation.LANDSCAPE_DOWN:
        penOffset.x = -1 * x; penOffset.y = 1 * y;
        break;
    }
    // console.log(orientation, penOffset);
    return penOffset;
  } catch (error) {
    console.log('Error getting device orientation', error);
  } finally {
    // console.log('Device orientation check complete', penOffset);
  }
}
