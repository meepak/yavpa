import { type Linecap, type Linejoin, Path } from "react-native-svg";
import { Dimensions, Platform } from "react-native";

export const I_AM_ANDROID = Platform.OS === "android";
export const I_AM_IOS = Platform.OS === "ios";

export const MY_BLACK = "#120e31";
export const MY_WHITE = "#ffffff";
export const MY_PRIMARY_COLOR = "#02093599";
export const MY_ON_PRIMARY_COLOR = "#ffe7f4";
export const MY_ON_PRIMARY_COLOR_OPTIONS = [
  "#ebe4ff",
  "#e2e4fd",
  "#f7eaff",
  "#f7f0f9",
  "#fefeff",
  "#fffbf9",
  "#f0f9f7",
  "#ffe7f4",
];

export const DEFAULT_STROKE_WIDTH = 3;
export const DEFAULT_SIMPLIFY_TOLERANCE = 0.0111;
export const DEFAULT_CURVE_POINTS_RESOLUTION = 100;
export const DEFAULT_STROKE_OPACITY = 1;

export type OrientationType =
  | Orientation.LANDSCAPE_DOWN
  | Orientation.LANDSCAPE_UP
  | Orientation.PORTRAIT_DOWN
  | Orientation.PORTRAIT_UP;

export enum Orientation {
  PORTRAIT_UP = "PORTRAIT_UP",
  PORTRAIT_DOWN = "PORTRAIT_DOWN",
  LANDSCAPE_UP = "LANDSCAPE_UP",
  LANDSCAPE_DOWN = "LANDSCAPE_DOWN",
}

export const PRECISION = 3;
export const SNAPPING_TOLERANCE = 30;
// ---- fix for the canvas size ---------------------
export const SCREEN_WIDTH = Dimensions.get("window").width;
export const SCREEN_HEIGHT = Dimensions.get("window").height;
export const HEADER_HEIGHT = 110 + (I_AM_IOS ? 10 : 0);
// We need to make footer optional through configuration, i can't adjust that if heigt is constant
// TODO once user configuration is implemented, take footer height from context
export const FOOTER_HEIGHT = 0; // 40;
export const CANVAS_PADDING_HORIZONTAL = 15;
export const CANVAS_PADDING_VERTICAL = 15;

// Thus,
export const CANVAS_WIDTH = SCREEN_WIDTH - CANVAS_PADDING_HORIZONTAL * 2;
export const CANVAS_HEIGHT =
  SCREEN_HEIGHT - HEADER_HEIGHT - CANVAS_PADDING_VERTICAL * 1.5 - FOOTER_HEIGHT; // + (I_AM_ANDROID ? 20 : 0);
export const CANVAS_VIEWBOX_DEFAULT = `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`;
export const CANVAS_PATH = `M0,0 L${CANVAS_WIDTH},0 L${CANVAS_WIDTH},${CANVAS_HEIGHT} L0,${CANVAS_HEIGHT} Z`;

export const FILE_PREVIEW_WIDTH = 108; // boxes in browse file page

export const BLUE_BUTTON_WIDTH = 100;
// MyConsole.log('SCREEN_WIDTH', SCREEN_WIDTH);
// myConsole.log('SCREEN_HEIGHT', SCREEN_HEIGHT);
// myConsole.log('HEADER_HEIGHT', HEADER_HEIGHT);
// myConsole.log('CANVAS_WIDTH', CANVAS_WIDTH);
// myConsole.log('CANVAS_HEIGHT', CANVAS_HEIGHT);

// -------------------------------------------------

export const FILM_STRIP_HOLE_HEIGHT = 12;
export const NUM_FILM_STRIP_HOLES =
  Number.parseInt(
    ((SCREEN_HEIGHT - HEADER_HEIGHT) / FILM_STRIP_HOLE_HEIGHT).toString(),
  ) + 10;

// -----------------------------------------------

export const ScreenModeInstruction = {
  Draw: "Press to preview your drawing and edit animation.",
  Path2Dreview: "Press to export your drawing",
  Export: "Press to edit your drawing",
};

export const ScreenModes: ScreenModeType[] = [
  { name: "Draw", icon: "edit" }, // Show preview icon in draw
  { name: "Preview", icon: "preview" }, // I guess it makes ore sense??
  { name: "Export", icon: "export" },
];

export type ScreenModeType = { name: string; icon: string };

export type ScreenShotType = "canvas" | "full";

export enum PathPointType {
  None = "",
  MoveTo = "M",
  LineTo = "L",
  QuadraticCurveTo = "Q",
  BezierCurveTo = "C",
  ArcTo = "A2",
  Arc = "A",
  Rect = "R",
  ClosePath = "Z",
}

export type PathDataType = {
  type: "d";
  updatedAt?: string; // Primarily used for rendering purpose a
  path: string; // Svg path, e.g. "M0,0 L100,100" only contains M & L commands
  length: number; // Length of the path calculated by summing distance between two consecutive points
  time: number; // Total time in ms taken to draw the path
  stroke: string; // Stroke color or brush name
  strokeWidth: number; // Stroke width
  strokeOpacity: number; // Stroke opacity
  strokeCap?: Linecap; // Stroke linecap
  strokeJoin?: Linejoin; // Stroke linejoin
  strokeDasharray?: string | undefined; // Stroke dasharray
  strokeDashoffset?: number | undefined; // Stroke dashoffset
  fill?: string; // Fill color
  guid: string; // Unique identifier for each path
  visible: boolean; // Is path visible (allows to hide path without deleting them permanently)
  zIndex?: number; // Z-index, used if order of path has to be specified, normally its inferred from object's index in parent array
  text?: {
    // Text to be drawn along the path
    value: string; // Text value
    above?: number; // Distance above the path
    fontSize?: number; // Font size
    fontWeight?: string; // Font weight
    color?: string; // Font color
    startOffset?: string; // Start offset
  };
  selected?: boolean; // TODO handle this with selected path context or anything else but path prop
  edit?: boolean;
};

export type ImageDataType = {
  type: "image";
  data: string; // Base64 encoded image data
  width: number; // Width of the image
  height: number; // Height of the image
  x: number; // X position of the image
  y: number; // Y position of the image
  guid: string; // Unique identifier for each image
  visible: boolean; // Is image visible (allows to hide image without deleting them permanently)
  rotation: number; // Rotation of the image
  scale: number; // Scale of the image
  opacity: number; // Opacity of the image
  selected?: boolean; // TODO handle this with selected image context or anything else but image prop
};

export type MetaDataType = {
  guid: string; // Unique identifier for each svg
  created_at: string; // Timestamp when svg was created
  updatedAt: string; // Timestamp when svg was last updated
  name: string; // Name of the svg
  canvasWidth: number; // Width of the canvas
  canvasHeight: number; // Height of the canvas
  canvasScale: number; // Scale of the canvas
  canvasTranslateX: number; // TranslateX of the canvas
  canvasTranslateY: number; // TranslateY of the canvas
  // viewBox: string; // Deprecate this,..Default viewBox of the svg
  // viewBoxTrimmed?: string; // ViewBox of the svg after trimming
  lastScreenMode?: string; // Last screen mode
  editable?: boolean; // Is svg editable
  animation?: AnimationParamsType;
  variable: any[]; // Variable for storing any temporary data during operation
};

export type MyPathDataType = {
  pathData: PathDataType[];
  metaData: MetaDataType;
  imageData?: ImageDataType[];
  updatedAt?: string; // TODO THIS IS BETTER THAN UPDATED AT WITHIN METADATA TO SEND BLANK, CHANGE OF THIS VALUE WILL 100% TRIGGER RERENDER
};

export type MyPathDataContextType = {
  loadNewFile: (newMyPathData: MyPathDataType) => void;
  myPathData: MyPathDataType;
  setMyPathData: React.Dispatch<React.SetStateAction<MyPathDataType>>;
  undo: () => void;
  redo: () => void;
};

export enum TransitionType {
  None, // 0
  Fade, // 1
  Shrink, // 2
  Grow, // 3
  Shake, // 4
}

export type AnimationParamsType = {
  speed: number;
  loop: boolean;
  delay: number;
  transition: number;
  transitionType: TransitionType;
  correction: number;
};

export type SvgAnimateHandle = {
  playAnimation: () => void;
  loopAnimation: () => void;
  stopAnimation: () => void;
  saveAnimationParams: (value: AnimationParamsType) => void;
};

export type BrushType = {
  name:
    | "LinearGradientBrush"
    | "RadialGradientBrush"
    | "PatternBrush"
    | "BlurBrush";
  params: GradientBrushPropType | PatternBrushPropType | { guid: string };
};

export type BlurBrushProp = { guid: string };

export type GradientBrushPropType = {
  guid: string;
  colors: string[];
  gradientTransform?: string;
};

export type PatternBrushPropType = { guid: string; pattern: number };

export type PointType = { x: number; y: number };

export type ShapeType = { name: string; start: PointType; end: PointType };

export const AvailableShapes = [
  "freehand",
  "— line",
  "◯ circle",
  "□ square",
  "▭ rectangle",
  "☆ star",
  "♡ heart",
  "⬠ pentagon",
  "⬡ hexagon",
  "octagon",
  "triangle",
  "star-6",
  "star-8",
  "star-10",
];

export const ModalAnimations: any = {
  bounce: "bounce",
  flash: "flash",
  jello: "jello",
  pulse: "pulse",
  rotate: "rotate",
  rubberBand: "rubberBand",
  shake: "shake",
  swing: "swing",
  tada: "tada",
  wobble: "wobble",
  bounceIn: "bounceIn",
  bounceInDown: "bounceInDown",
  bounceInUp: "bounceInUp",
  bounceInLeft: "bounceInLeft",
  bounceInRight: "bounceInRight",
  bounceOut: "bounceOut",
  bounceOutDown: "bounceOutDown",
  bounceOutUp: "bounceOutUp",
  bounceOutLeft: "bounceOutLeft",
  bounceOutRight: "bounceOutRight",
  fadeIn: "fadeIn",
  fadeInDown: "fadeInDown",
  fadeInDownBig: "fadeInDownBig",
  fadeInUp: "fadeInUp",
  fadeInUpBig: "fadeInUpBig",
  fadeInLeft: "fadeInLeft",
  fadeInLeftBig: "fadeInLeftBig",
  fadeInRight: "fadeInRight",
  fadeInRightBig: "fadeInRightBig",
  fadeOut: "fadeOut",
  fadeOutDown: "fadeOutDown",
  fadeOutDownBig: "fadeOutDownBig",
  fadeOutUp: "fadeOutUp",
  fadeOutUpBig: "fadeOutUpBig",
  fadeOutLeft: "fadeOutLeft",
  fadeOutLeftBig: "fadeOutLeftBig",
  fadeOutRight: "fadeOutRight",
  fadeOutRightBig: "fadeOutRightBig",
  flipInX: "flipInX",
  flipInY: "flipInY",
  flipOutX: "flipOutX",
  flipOutY: "flipOutY",
  lightSpeedIn: "lightSpeedIn",
  lightSpeedOut: "lightSpeedOut",
  slideInDown: "slideInDown",
  slideInUp: "slideInUp",
  slideInLeft: "slideInLeft",
  slideInRight: "slideInRight",
  slideOutDown: "slideOutDown",
  slideOutUp: "slideOutUp",
  slideOutLeft: "slideOutLeft",
  slideOutRight: "slideOutRight",
  zoomIn: "zoomIn",
  zoomInDown: "zoomInDown",
  zoomInUp: "zoomInUp",
  zoomInLeft: "zoomInLeft",
  zoomInRight: "zoomInRight",
  zoomOut: "zoomOut",
  zoomOutDown: "zoomOutDown",
  zoomOutUp: "zoomOutUp",
  zoomOutLeft: "zoomOutLeft",
  zoomOutRight: "zoomOutRight",
};
