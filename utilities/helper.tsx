import * as Crypto from "expo-crypto";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Dimensions, Platform } from "react-native";
import { Linecap, Linejoin } from "react-native-svg";
import { CANVAS_HEIGHT, CANVAS_WIDTH, ScreenModes } from "./constants";
import { PathDataType, SvgDataType } from "./types";

// TODO move this to constants
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;



export const createSvgData = (defaultViewBoxWidth?: number, defaultViewBoxHeight?: number): SvgDataType => ({
  pathData: [],
  metaData: {
    guid: Crypto.randomUUID(),
    created_at: Date.now().toString(),
    updated_at: Date.now().toString(),
    name: "",
    viewBox: `0 0 ${defaultViewBoxWidth ?? screenWidth} ${defaultViewBoxHeight ?? screenHeight - 111}`,
    lastScreenMode: ScreenModes[0].name,
    editable: true,
    animation: {
      speed: 1,
      loop: true,
      delay: 0,
    }
  },
});

// not used but keeping for reference
export const createPathdata = (
  stroke?: string,
  strokeWidth?: number,
  strokeOpacity?: number,
  strokeCap?: Linecap,
  strokeJoin?: Linejoin
): PathDataType => ({
  path: "",
  stroke: stroke ?? "#000000",
  strokeWidth: strokeWidth ?? 2,
  strokeOpacity: strokeOpacity ?? 1,
  strokeCap: strokeCap ?? "round", // other support in next version only
  strokeJoin: strokeJoin ?? "round",
  length: 0,
  time: 0,
  visible: false,
  guid: Crypto.randomUUID(),
});

export const getPathFromPoints = (points: { x: any; y: any; }[], precision = 3) => {
  const path = points.map(({ x, y }) => `L${parseFloat(x as unknown as string).toFixed(precision)},${parseFloat(y as unknown as string).toFixed(precision)}`).join("");
  return `M${path.slice(1)}`;
};

export const getPointsFromPath = (path) => {
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
  return points;
};

export const getViewBoxTrimmed = (pathData: PathDataType[]) => {
  let minX = CANVAS_WIDTH ?? screenWidth;
  let minY = CANVAS_HEIGHT ?? screenHeight;
  let maxX = 0;
  let maxY = 0;
  let offset = 20;

  // console.log("pathData", pathData)
  pathData.forEach((path) => {
    // console.log("path", path)
    const points = getPointsFromPath(path.path);
    // console.log("points", points);
    points.forEach((point) => {
      if(point.x === undefined || point.y === undefined) {
        console.log("point.x or point.y is undefined", point);
        return;
      }
      if(Number.isNaN(point.x) || Number.isNaN(point.y)) {
        console.log("point.x or point.y is NaN", point);
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
  console.log("viewBox trimmed", viewBox);
  return viewBox;
};

export const isAndroid = Platform.OS === "android";
export const isIOS =  Platform.OS === "ios";

export const HeaderGradientBackground = ({ children }) =>
  <>
    <LinearGradient colors={['#015ccd', '#a805ee', '#1d0f98']} style={{...StyleSheet.absoluteFillObject, 
                    zIndex: -1,}} />
    {children}
  </>
