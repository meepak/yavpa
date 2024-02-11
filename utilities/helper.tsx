import * as Crypto from "expo-crypto";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Dimensions, Platform } from "react-native";
import { Linecap, Linejoin } from "react-native-svg";

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
  path: string;
  length: number;
  time: number;
  stroke: string;
  strokeWidth: number;
  strokeOpacity?: number;
  strokeCap?: Linecap;
  strokeJoin?: Linejoin;
  guid: string;
  visible: boolean;
};

// Define type of SvgData
export type SvgDataType = {
  pathData: PathDataType[];
  metaData: {
    guid: string;
    created_at: string;
    updated_at: string;
    name: string;
    viewBox: string;
    lastScreenMode?: string;
    editable?: boolean;
  };
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

export const getPathFromPoints = (points: { x: any; y: any; }[]) => {
  const path = points.map(({ x, y }) => `L${x},${y}`).join("");
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
  let minX = screenWidth;
  let minY = screenHeight;
  let maxX = 0;
  let maxY = 0;
  let offset = 20;

  // console.log("pathData", pathData)
  pathData.forEach((path) => {
    // console.log("path", path)
    const points = getPointsFromPath(path.path);
    // console.log("points", points);
    points.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });

  return `${minX - offset} ${minY - offset} ${maxX - minX + 2 * offset} ${maxY - minY + 2 * offset}`;
};

export const isAndroid = Platform.OS === "android";
export const isIOS =  Platform.OS === "ios";

export const HeaderGradientBackground = ({ children }) =>
  <>
    <LinearGradient colors={['#015ccd', '#a805ee', '#1d0f98']} style={StyleSheet.absoluteFill} />
    {children}
  </>
