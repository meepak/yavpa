import { Dimensions } from "react-native";

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