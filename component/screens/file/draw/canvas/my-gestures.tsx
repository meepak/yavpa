
import { SetStateAction } from "react";
import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import {
  PathDataType,
  MetaDataType,
  SvgDataType,
  ShapeType,
  PointType
} from "@u/types";
import { handleDrawingEvent } from "./handle-drawing-event";
import { handleSelectEvent } from "./handle-select-event";
import { handleDragEvent } from "./handle-drag-event";
import { handleScaleEvent } from "./handle-scale-event";
import { handleRotateEvent } from "./handle-rotate-event";
import { handleSvgDragEvent } from "./handle-svg-drag-event";


type MyGesturesProps = {
  svgData: { pathData: PathDataType[]; metaData: MetaDataType; },
  setSvgData: (value: SetStateAction<SvgDataType>) => void,
  editMode: boolean,
  currentPath: PathDataType,
  setCurrentPath: (value: SetStateAction<PathDataType>) => void,
  startTime: number,
  setStartTime: (value: SetStateAction<number>) => void,
  newPathData: () => PathDataType,
  currentShape: ShapeType,
  setCurrentShape: (value: SetStateAction<ShapeType>) => void,
  simplifyTolerance: number,
  d3CurveBasis: string,
  activeBoundaryBoxPath: PathDataType | null,
  setActiveBoundaryBoxPath: (value: SetStateAction<PathDataType | null>) => void,
  setMenuPosition: (value: SetStateAction<PointType>) => void,
  children: React.ReactNode,
};

export const MyGestures = ({
  svgData,
  setSvgData,
  editMode,
  currentPath,
  setCurrentPath,
  startTime,
  setStartTime,
  newPathData,
  currentShape,
  setCurrentShape,
  simplifyTolerance,
  d3CurveBasis,
  activeBoundaryBoxPath,
  setActiveBoundaryBoxPath,
  setMenuPosition,
  children,
}: MyGesturesProps): React.ReactNode => {

  const handlePanDrawingEvent = (event: GestureUpdateEvent<PanGestureHandlerEventPayload>, state: string) => {
    handleDrawingEvent(
      event,
      state,
      svgData,
      setSvgData,
      editMode,
      currentPath,
      setCurrentPath,
      startTime,
      setStartTime,
      newPathData,
      currentShape,
      setCurrentShape,
      simplifyTolerance,
      d3CurveBasis
    );
  };


  const doubleTapSelectGesture = Gesture.Tap()
  doubleTapSelectGesture.numberOfTaps(2).onEnd((event) => handleSelectEvent(event, activeBoundaryBoxPath, setSvgData));


  const panDrawGesture = Gesture.Pan();
  panDrawGesture.shouldCancelWhenOutside(false);
  panDrawGesture.minPointers(1);
  panDrawGesture.maxPointers(1);
  panDrawGesture.onBegin((event) => handlePanDrawingEvent(event, "began"))
    .onUpdate((event) => handlePanDrawingEvent(event, "active"))
    .onEnd((event) => handlePanDrawingEvent(event, "ended"));


  const panDragGesture = Gesture.Pan()
  panDragGesture.shouldCancelWhenOutside(false);
  panDragGesture.minPointers(1);
  panDragGesture.maxPointers(1);
  panDragGesture.onBegin((event) => handleDragEvent(event, "began", editMode, setSvgData, activeBoundaryBoxPath, setActiveBoundaryBoxPath ))
    .onUpdate((event) => handleDragEvent(event, "active", editMode, setSvgData, activeBoundaryBoxPath, setActiveBoundaryBoxPath))
    .onEnd((event) => handleDragEvent(event, "ended", editMode, setSvgData, activeBoundaryBoxPath, setActiveBoundaryBoxPath));


  const pinchZoomGesture = Gesture.Pinch()
  pinchZoomGesture.onBegin((event) => handleScaleEvent(event, "began", editMode, setSvgData, activeBoundaryBoxPath, setActiveBoundaryBoxPath))
    .onUpdate((event) => handleScaleEvent(event, "active", editMode, setSvgData, activeBoundaryBoxPath, setActiveBoundaryBoxPath))
    .onEnd((event) => handleScaleEvent(event, "ended", editMode, setSvgData, activeBoundaryBoxPath, setActiveBoundaryBoxPath));


  const rotateGesture = Gesture.Rotation()
  rotateGesture.onBegin((event) => handleRotateEvent(event, "active", editMode, setSvgData, activeBoundaryBoxPath, setActiveBoundaryBoxPath))
    .onUpdate((event) => handleRotateEvent(event, "began", editMode, setSvgData, activeBoundaryBoxPath, setActiveBoundaryBoxPath))
    .onEnd((event) => handleRotateEvent(event, "ended", editMode, setSvgData, activeBoundaryBoxPath, setActiveBoundaryBoxPath));

    const longPressGesture = Gesture.LongPress()
    longPressGesture.onStart((event) => {
      setMenuPosition({ x: event.x, y: event.y });
    });

  const composedPanTap = Gesture.Race(doubleTapSelectGesture, longPressGesture, panDragGesture)
  const composedPinch = Gesture.Race(pinchZoomGesture, rotateGesture)

  const composedGesture = Gesture.Simultaneous( panDrawGesture, composedPanTap, composedPinch)

  composedGesture.initialize();

  return (
    <GestureDetector gesture={composedGesture}>
        {children}
      </GestureDetector>
  );

}
