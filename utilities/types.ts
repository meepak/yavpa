import { Linecap, Linejoin } from "react-native-svg";
import { Dimensions } from "react-native";


export const PRECISION = 3;
// ---- fix for the canvas size ---------------------
export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Dimensions.get("window").height;
export const MAX_HEADER_HEIGHT = 110;
const CANVAS_PADDING_HORIZONTAL = 30;
const CANVAS_PADDING_VERTICAL = 30;

// Thus,
export const CANVAS_WIDTH = SCREEN_WIDTH - CANVAS_PADDING_HORIZONTAL * 2;
export const CANVAS_HEIGHT = SCREEN_HEIGHT - MAX_HEADER_HEIGHT - CANVAS_PADDING_VERTICAL * 2;
export const CANVAS_VIEWBOX = `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`;
export const CANVAS_PATH = `M0,0 L${CANVAS_WIDTH},0 L${CANVAS_WIDTH},${CANVAS_HEIGHT} L0,${CANVAS_HEIGHT} Z`;

// console.log('SCREEN_WIDTH', SCREEN_WIDTH);
// console.log('SCREEN_HEIGHT', SCREEN_HEIGHT);
// console.log('MAX_HEADER_HEIGHT', MAX_HEADER_HEIGHT);
// console.log('CANVAS_WIDTH', CANVAS_WIDTH);
// console.log('CANVAS_HEIGHT', CANVAS_HEIGHT);

// -------------------------------------------------

export const FILM_STRIP_HOLE_HEIGHT = 16;
export const NUM_FILM_STRIP_HOLES = parseInt(((SCREEN_HEIGHT - MAX_HEADER_HEIGHT) / FILM_STRIP_HOLE_HEIGHT).toString()) + 10;

// -----------------------------------------------


export const ScreenModeInstruction = {
    Draw: "Press to preview your drawing and edit animation.",
    Path2Dreview: "Press to export your drawing",
    Export: "Press to edit your drawing",
}


export const ScreenModes: ScreenModeType[] = [
    { name: "Draw", icon: "edit" },
    { name: "Preview", icon: "preview" },
    { name: "Export", icon: "export" },
];


export type ScreenModeType = { name: string, icon: string };


export type PathDataType = {
    path: string; // svg path, e.g. "M0,0 L100,100" only contains M & L commands
    length: number; // length of the path calculated by summing distance between two consecutive points
    time: number; // total time in ms taken to draw the path
    stroke: string; // stroke color or brush name
    strokeWidth: number; // stroke width
    strokeOpacity: number; // stroke opacity
    strokeCap?: Linecap; // stroke linecap
    strokeJoin?: Linejoin; // stroke linejoin
    strokeDasharray?: string | undefined; // stroke dasharray
    strokeDashoffset?: number | undefined; // stroke dashoffset
    fill?: string; // fill color
    guid: string; // unique identifier for each path
    visible: boolean; // is path visible (allows to hide path without deleting them permanently)
    zIndex?: number; // z-index, used if order of path has to be specified, normally its inferred from object's index in parent array
    text?: {  // text to be drawn along the path
        value: string; // text value
        above?: number; // distance above the path
        fontSize?: number; // font size
        fontWeight?: string; // font weight
        color?: string; // font color
        startOffset?: string; // start offset
    };
    selected?: boolean; // TODO handle this with selected path context or anything else but path prop
};

export type MetaDataType = {
    guid: string; // unique identifier for each svg
    created_at: string; // timestamp when svg was created
    updated_at: string; // timestamp when svg was last updated
    name: string; // name of the svg
    viewBox: string; // default viewBox of the svg
    viewBoxTrimmed?: string; // viewBox of the svg after trimming
    lastScreenMode?: string; // last screen mode
    editable?: boolean; // is svg editable
    animation?: AnimationParamsType;
};


export type SvgDataType = {
    pathData: PathDataType[];
    metaData: MetaDataType;
};

export interface SvgDataContextType {
    svgData: SvgDataType;
    setSvgData: React.Dispatch<React.SetStateAction<SvgDataType>>;
}

export enum TransitionType {
    None,     //0
    Fade,     //1
    Shrink,   //2
    Grow,     //3
    Vibrate,  //4
}

export type AnimationParamsType = {
    speed: number;
    loop: boolean;
    delay: number;
    transition: number;
    transitionType: TransitionType;
    correction: number;
}

export interface SvgAnimateHandle {
    playAnimation: () => void;
    loopAnimation: () => void;
    replayAnimation: () => void;
    stopAnimation: () => void;
    setAnimationParams: (value: AnimationParamsType) => void;
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

export const AvailableShapes = [
    'freehand',
    '— line',
    '◯ circle',
    '□ square',
    '▭ rectangle',
    '☆ star',
    '♡ heart',
    '⬠ pentagon',
    '⬡ hexagon',
    'octagon',
    'triangle',
    'star-6',
    'star-8',
    'star-10',
];

export const ModalAnimations: ModalAnimationType[] = [
    "bounce", "flash", "jello", "pulse", "rotate", "rubberBand", "shake",
    "swing", "tada", "wobble", "bounceIn", "bounceInDown", "bounceInUp",
    "bounceInLeft", "bounceInRight", "bounceOut", "bounceOutDown",
    "bounceOutUp", "bounceOutLeft", "bounceOutRight", "fadeIn",
    "fadeInDown", "fadeInDownBig", "fadeInUp", "fadeInUpBig", "fadeInLeft",
    "fadeInLeftBig", "fadeInRight", "fadeInRightBig", "fadeOut",
    "fadeOutDown", "fadeOutDownBig", "fadeOutUp", "fadeOutUpBig", "fadeOutLeft",
    "fadeOutLeftBig", "fadeOutRight", "fadeOutRightBig", "flipInX", "flipInY",
    "flipOutX", "flipOutY", "lightSpeedIn", "lightSpeedOut", "slideInDown",
    "slideInUp", "slideInLeft", "slideInRight", "slideOutDown", "slideOutUp",
    "slideOutLeft", "slideOutRight", "zoomIn", "zoomInDown", "zoomInUp",
    "zoomInLeft", "zoomInRight", "zoomOut", "zoomOutDown", "zoomOutUp",
    "zoomOutLeft", "zoomOutRight"];

