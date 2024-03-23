import { Linecap, Linejoin } from "react-native-svg";
import { Dimensions, Platform } from "react-native";




export const I_AM_ANDROID = Platform.OS === "android";
export const I_AM_IOS = Platform.OS === "ios";

export const MY_BLACK = '#120e31'

export enum Orientation {
    PORTRAIT_UP = "PORTRAIT_UP",
    PORTRAIT_DOWN = "PORTRAIT_DOWN",
    LANDSCAPE_UP = "LANDSCAPE_UP",
    LANDSCAPE_DOWN = "LANDSCAPE_DOWN",
}

export const PRECISION = 3;
// ---- fix for the canvas size ---------------------
export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Dimensions.get("window").height;
export const HEADER_HEIGHT = 140;
// We need to make footer optional through configuration, i can't adjust that if heigt is constant
// TODO once user configuration is implemented, take footer height from context
export const FOOTER_HEIGHT = 0; //40;
export const CANVAS_PADDING_HORIZONTAL = 20;
export const CANVAS_PADDING_VERTICAL = 25;

// Thus,
export const CANVAS_WIDTH = SCREEN_WIDTH - CANVAS_PADDING_HORIZONTAL * 2;
export const CANVAS_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - CANVAS_PADDING_VERTICAL * 2 -  FOOTER_HEIGHT + (I_AM_ANDROID ? 30 : 0);
export const CANVAS_VIEWBOX = `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`;
export const CANVAS_PATH = `M0,0 L${CANVAS_WIDTH},0 L${CANVAS_WIDTH},${CANVAS_HEIGHT} L0,${CANVAS_HEIGHT} Z`;

export const BLUE_BUTTON_WIDTH = 100;
// myConsole.log('SCREEN_WIDTH', SCREEN_WIDTH);
// myConsole.log('SCREEN_HEIGHT', SCREEN_HEIGHT);
// myConsole.log('HEADER_HEIGHT', HEADER_HEIGHT);
// myConsole.log('CANVAS_WIDTH', CANVAS_WIDTH);
// myConsole.log('CANVAS_HEIGHT', CANVAS_HEIGHT);

// -------------------------------------------------

export const FILM_STRIP_HOLE_HEIGHT = 12;
export const NUM_FILM_STRIP_HOLES = parseInt(((SCREEN_HEIGHT - HEADER_HEIGHT) / FILM_STRIP_HOLE_HEIGHT).toString()) + 10;

// -----------------------------------------------


export const ScreenModeInstruction = {
    Draw: "Press to preview your drawing and edit animation.",
    Path2Dreview: "Press to export your drawing",
    Export: "Press to edit your drawing",
}


export const ScreenModes: ScreenModeType[] = [
    { name: "Draw", icon: "edit" }, // show preview icon in draw
    { name: "Preview", icon: "preview" }, // I guess it makes ore sense??
    { name: "Export", icon: "export" },
];


export type ScreenModeType = { name: string, icon: string };


export type PathDataType = {
    updatedAt?: string; // primarily used for rendering purpose a
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
    selected?: boolean; //TODO handle this with selected path context or anything else but path prop
};

export type MetaDataType = {
    guid: string; // unique identifier for each svg
    created_at: string; // timestamp when svg was created
    updatedAt: string; // timestamp when svg was last updated
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
    updatedAt?:string; // TODO THIS IS BETTER THAN UPDATED AT WITHIN METADATA TO SEND BLANK, CHANGE OF THIS VALUE WILL 100% TRIGGER RERENDER
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
    'PatternBrush'|'BlurBrush';
    params: GradientBrushPropType |
    PatternBrushPropType|
    {guid: string};
}

export type BlurBrushProp = {guid: string };

export type GradientBrushPropType = { guid: string, colors: string[], gradientTransform?: string };

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

export const ModalAnimations: any = {
    bounce: "bounce", flash: "flash", jello: "jello", pulse: "pulse", rotate: "rotate", rubberBand: "rubberBand", shake: "shake",
    swing: "swing", tada: "tada", wobble: "wobble", bounceIn: "bounceIn", bounceInDown: "bounceInDown", bounceInUp: "bounceInUp",
    bounceInLeft: "bounceInLeft", bounceInRight: "bounceInRight", bounceOut: "bounceOut", bounceOutDown: "bounceOutDown",
    bounceOutUp: "bounceOutUp", bounceOutLeft: "bounceOutLeft", bounceOutRight: "bounceOutRight", fadeIn: "fadeIn",
    fadeInDown: "fadeInDown", fadeInDownBig: "fadeInDownBig", fadeInUp: "fadeInUp", fadeInUpBig: "fadeInUpBig", fadeInLeft: "fadeInLeft",
    fadeInLeftBig: "fadeInLeftBig", fadeInRight: "fadeInRight", fadeInRightBig: "fadeInRightBig", fadeOut: "fadeOut",
    fadeOutDown: "fadeOutDown", fadeOutDownBig: "fadeOutDownBig", fadeOutUp: "fadeOutUp", fadeOutUpBig: "fadeOutUpBig", fadeOutLeft: "fadeOutLeft",
    fadeOutLeftBig: "fadeOutLeftBig", fadeOutRight: "fadeOutRight", fadeOutRightBig: "fadeOutRightBig", flipInX: "flipInX", flipInY: "flipInY",
    flipOutX: "flipOutX", flipOutY: "flipOutY", lightSpeedIn: "lightSpeedIn", lightSpeedOut: "lightSpeedOut", slideInDown: "slideInDown",
    slideInUp: "slideInUp", slideInLeft: "slideInLeft", slideInRight: "slideInRight", slideOutDown: "slideOutDown", slideOutUp: "slideOutUp",
    slideOutLeft: "slideOutLeft", slideOutRight: "slideOutRight", zoomIn: "zoomIn", zoomInDown: "zoomInDown", zoomInUp: "zoomInUp",
    zoomInLeft: "zoomInLeft", zoomInRight: "zoomInRight", zoomOut: "zoomOut", zoomOutDown: "zoomOutDown", zoomOutUp: "zoomOutUp",
    zoomOutLeft: "zoomOutLeft", zoomOutRight: "zoomOutRight"
};

