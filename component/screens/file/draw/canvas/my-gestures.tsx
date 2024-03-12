
import { SetStateAction } from "react";
import { Platform } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureStateChangeEvent,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
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

  const handleTapTapEvent = (event: GestureStateChangeEvent<TapGestureHandlerEventPayload>, state: string) => {
    console.log("handleTapTapEvent event in", Platform.OS);
    handleSelectEvent(
      event,
      activeBoundaryBoxPath,
      setSvgData,
    );
  }

  const handlePanDrawingEvent = (event: GestureUpdateEvent<PanGestureHandlerEventPayload>, state: string) => {
    console.log("handlePanDrawingEvent event in", Platform.OS);
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
    console.log("handlePanSelectEvent event in", Platform.OS);
    handleDragEvent(
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
  doubleTapSelectGesture.numberOfTaps(2).onEnd((event) => handleTapTapEvent(event, "double-tapped"));


  const pinchZoomGesture = Gesture.Pinch()
    .onUpdate((event) => {
      console.log("pinchZoomGesture onUpdate", event.scale);
      // handle
      // scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      // savedScale.value = scale.value;
    });

  const rotateGesture = Gesture.Rotation()
    .onUpdate((event) => {
      console.log("rotateGesture onUpdate", event.rotation);
      // rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      // savedRotation.value = rotation.value;
    });



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
