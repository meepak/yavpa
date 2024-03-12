
import { SetStateAction } from "react";
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
  PinchGestureHandlerEventPayload,
  RotationGestureHandlerEventPayload,
  TapGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import {
  PathDataType,
  MetaDataType,
  SvgDataType,
  ShapeType
} from "@u/types";
import { handleDrawingEvent } from "./handle-drawing-event";
import { handleSelectEvent } from "./handle-select-event";
import { handleDragEvent } from "./handle-drag-event";
import { handleScaleEvent } from "./handle-scale-event";
import { handleRotateEvent } from "./handle-rotate-event";


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
  children,
}: MyGesturesProps): React.ReactNode => {

  const handleDoubleTapEvent = (event: GestureStateChangeEvent<TapGestureHandlerEventPayload>, state: string) => {
    // console.log("handleTapTapEvent event in", Platform.OS);
    handleSelectEvent(
      event,
      activeBoundaryBoxPath,
      setSvgData,
    );
  }

  const handlePanDrawingEvent = (event: GestureUpdateEvent<PanGestureHandlerEventPayload>, state: string) => {
    // console.log("handlePanDrawingEvent event in", Platform.OS);
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

  const handlePanSelectEvent = (event: GestureUpdateEvent<PanGestureHandlerEventPayload>, state: string) => {
    // console.log("handlePanSelectEvent event in", Platform.OS);
    handleDragEvent(
      event,
      state,
      editMode,
      setSvgData,
      activeBoundaryBoxPath,
      setActiveBoundaryBoxPath,
    );
  };

  const handlePinchScaleEvent = (event: GestureUpdateEvent<PinchGestureHandlerEventPayload>, state: string) => {
    // console.log("handlePanSelectEvent event in", Platform.OS);
    handleScaleEvent(
      event,
      state,
      editMode,
      setSvgData,
      activeBoundaryBoxPath,
      setActiveBoundaryBoxPath,
    );
  };


  const handleRotateGestureEvent = (event: GestureUpdateEvent<RotationGestureHandlerEventPayload>, state: string) => {
    console.log("handleRotateEvent event", event.rotation);
    handleRotateEvent(
      event,
      state,
      editMode,
      setSvgData,
      activeBoundaryBoxPath,
      setActiveBoundaryBoxPath,
    );
  };


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
  panDragGesture.onBegin((event) => handlePanSelectEvent(event, "began"))
    .onUpdate((event) => handlePanSelectEvent(event, "active"))
    .onEnd((event) => handlePanSelectEvent(event, "ended"));



  const doubleTapSelectGesture = Gesture.Tap()
  doubleTapSelectGesture.numberOfTaps(2).onEnd((event) => handleDoubleTapEvent(event, "double-tapped"));


  const pinchZoomGesture = Gesture.Pinch()
  pinchZoomGesture.onBegin((event) => handlePinchScaleEvent(event, "began"))
    .onUpdate((event) => handlePinchScaleEvent(event, "active"))
    .onEnd((event) => handlePinchScaleEvent(event, "ended"));


  const rotateGesture = Gesture.Rotation()
  rotateGesture.onBegin((event) => handleRotateGestureEvent(event, "began"))
    .onUpdate((event) => handleRotateGestureEvent(event, "active"))
    .onEnd((event) => handleRotateGestureEvent(event, "ended"));


  const composedPanTap = Gesture.Simultaneous(doubleTapSelectGesture, panDragGesture, panDrawGesture)
  const composedPinch = Gesture.Simultaneous(pinchZoomGesture, rotateGesture)

  composedPanTap.initialize();
  composedPinch.initialize();

  return (
    <GestureDetector gesture={composedPanTap}>
      <GestureDetector gesture={composedPinch}>
        {children}
      </GestureDetector>
    </GestureDetector>
  );

}
