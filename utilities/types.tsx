import { Linecap, Linejoin } from "react-native-svg";
import { Dimensions } from "react-native";


export const PRECISION = 3;
// ---- fix for the canvas size ---------------------
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const MAX_HEADER_HEIGHT = 110;
const CANVAS_PADDING = 20;
// Thus,
export const CANVAS_WIDTH = SCREEN_WIDTH - CANVAS_PADDING * 2;
export const CANVAS_HEIGHT = SCREEN_HEIGHT - MAX_HEADER_HEIGHT - CANVAS_PADDING * 2;
export const DEFAULT_VIEWBOX = `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`;
// -------------------------------------------------

export const ScreenModes: ScreenModeType[] = [
    { name: "Draw", icon: "edit" },
    { name: "Preview", icon: "preview" },
    { name: "Export", icon: "export" },
  ];



export type ScreenModeType = { name: string, icon: string };


// TODO -- once stroke styles are added, have to update in 
// canvas, preview, formatter for export
// Define Type of PathData
export type PathDataType = {
    path: string; // svg path, e.g. "M0,0 L100,100" only contains M & L commands
    length: number; // length of the path calculated by summing distance between two consecutive points
    time: number; // total time in ms taken to draw the path
    stroke: string; // stroke color or brush name
    strokeWidth: number; // stroke width
    strokeOpacity?: number; // stroke opacity
    strokeCap?: Linecap; // stroke linecap
    strokeJoin?: Linejoin; // stroke linejoin
    strokeDasharray?: string|undefined; // stroke dasharray
    strokeDashoffset?: number|undefined; // stroke dashoffset
    fill?: string; // fill color
    guid: string; // unique identifier for each path
    visible: boolean; // is path visible (allows to hide path without deleting them permanently)
    brush?: BrushType; // brushes used in the svg
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
        correction?: number
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


export interface SvgAnimateHandle {
    playAnimation: () => void;
    loopAnimation: () => void;
    replayAnimation: () => void;
    stopAnimation: () => void;
    animationSpeed: (value: number) => void;
    animationLoop: (value: boolean) => void;
    animationDelay: (value: number) => void;
}

export type BrushType = {
    name: 'LinearGradientBrush' |
    'RadialGradientBrush' |
    'PatternBrush';
    params: GradientBrushPropType |
    PatternBrushPropType;
}

export type GradientBrushPropType = { guid: string, colors: string[] };

export type PatternBrushPropType = { guid: string, pattern: number };

export type PointType = { x: number, y: number };

export type ShapeType = { name: string, start: PointType, end: PointType };