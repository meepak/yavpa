import * as Crypto from "expo-crypto";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Dimensions, Platform } from "react-native";
import { Linecap, Linejoin } from "react-native-svg";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";

// TODO move this to constants
const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

export type ScreenModeType = { name: string, icon: string };
export const ScreenModes: ScreenModeType[] = [
  { name: "Draw", icon: "edit" },
  { name: "Preview", icon: "preview" },
  { name: "Export", icon: "export" },
];

// TODO -- once stroke styles are added, have to update in 
// canvas, preview, formatter for export
// Define Type of PathData
export type PathDataType = {
  path: string; // svg path, e.g. "M0,0 L100,100" only contains M & L commands
  length: number; // length of the path calculated by summing distance between two consecutive points
  time: number; // total time in ms taken to draw the path
  stroke: string; // stroke color
  strokeWidth: number; // stroke width
  strokeOpacity?: number; // stroke opacity
  strokeCap?: Linecap; // stroke linecap
  strokeJoin?: Linejoin; // stroke linejoin
  guid: string; // unique identifier for each path
  visible: boolean; // is path visible (allows to hide path without deleting them permanently)
};

export type MetaDataType = {
  guid: string; // unique identifier for each svg
  created_at: string; // timestamp when svg was created
  updated_at: string; // timestamp when svg was last updated
  name: string; // name of the svg
  viewBox: string; // viewBox of the svg
  lastScreenMode?: string; // last screen mode
  editable?: boolean; // is svg editable
  animation?: {
    speed?: number, // speed of the animation, total time = path.time / (speed * 1000) seconds
    loop?: boolean, // loop the animation
    delay?: number, // delay between animation loop
  }
};

// Define type of SvgData
export type SvgDataType = {
  pathData: PathDataType[];
  metaData: MetaDataType;
};

export interface SvgDataContextType {
  svgData: SvgDataType;
  setSvgData: React.Dispatch<React.SetStateAction<SvgDataType>>;
}

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
