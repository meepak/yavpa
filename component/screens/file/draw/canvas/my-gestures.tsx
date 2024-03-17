
import { SetStateAction, useCallback, useEffect, useState } from "react";
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
  PointType,
  Orientation
} from "@u/types";
import { handleDrawingEvent } from "./handle-drawing-event";
import { handleSelectEvent } from "./handle-select-event";
import { handleDragEvent } from "./handle-drag-event";
import { handleScaleEvent } from "./handle-scale-event";
import { handleRotateEvent } from "./handle-rotate-event";
import { throttle } from "lodash";
import { getBoundaryBox } from "@u/boundary-box";
import { getDeviceOrientation, getPathLength, getPointsFromPath } from "@u/helper";


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
  viewBoxAdjustMode: boolean,
  setViewBoxAdjustMode: (value: SetStateAction<boolean>) => void,
  children: React.ReactNode,
};

// TODO make this user onfigurable for tiny finger people
const penOffset = { x: 30, y: 30 };

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
  viewBoxAdjustMode,
  setViewBoxAdjustMode,
  children,
}: MyGesturesProps): React.ReactNode => {




  // For all things related to drawing a path
  const handlePanDrawingEvent = async (event: GestureUpdateEvent<PanGestureHandlerEventPayload>, state: string) => {
    if (state === "began") {
      try {
        const orientation = await getDeviceOrientation();
        // console.log('Device orientation', orientation);
        let x = Math.abs(penOffset.x);
        let y = Math.abs(penOffset.y);
        switch (orientation) {
          case Orientation.PORTRAIT_UP:
            penOffset.x = -1 * x; penOffset.y = -1 * y;
            break;
          case Orientation.PORTRAIT_DOWN:
            penOffset.x = 1 * x; penOffset.y = 1 * y;
            break;
          case Orientation.LANDSCAPE_UP:
            penOffset.x = 1 * x; penOffset.y = -1 * y;
            break;
          case Orientation.LANDSCAPE_DOWN:
            penOffset.x = -1 * x; penOffset.y = 1 * y;
            break;
        }
      } catch (error) {
        console.log('Error getting device orientation', error);
      } finally {
        // console.log('Device orientation check complete', penOffset);
      }
    }

    // console.log('penOffset', penOffset);
    handleDrawingEvent(
      event,
      state,
      penOffset,
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

  const panDrawGesture = Gesture.Pan();
  panDrawGesture.shouldCancelWhenOutside(false);
  panDrawGesture.minPointers(1);
  panDrawGesture.maxPointers(1);
  panDrawGesture.onBegin((event) => handlePanDrawingEvent(event, "began"))
    .onUpdate((event) => handlePanDrawingEvent(event, "active"))
    .onEnd((event) => handlePanDrawingEvent(event, "ended"));

  // --------------------------------------

  // For paths selection on screen
  const doubleTapSelectGesture = Gesture.Tap()
  doubleTapSelectGesture.numberOfTaps(2).onEnd((event) => {
    setViewBoxAdjustMode(false);
    handleSelectEvent(event, activeBoundaryBoxPath, setSvgData);
  });

  // once select mode is activated by double tap, single tap can also select the path
  // handy but creating confusion
  // const tapSelectGesture = Gesture.Tap()
  // tapSelectGesture.numberOfTaps(1).onEnd((event) => {
  //   if(!activeBoundaryBoxPath) return;
  //   handleSelectEvent(event, activeBoundaryBoxPath, setSvgData);
  // });

  //--------------------------------------
  const resetBoundaryBox = () => {
    const selectedPaths = svgData.pathData.filter((item) => item.selected === true);
    const bBoxPath = getBoundaryBox(selectedPaths);
    setActiveBoundaryBoxPath(bBoxPath);
  }

  // For moving paths on screen
  const panDragEvent = throttle((event, state) => {
    handleDragEvent(event, state, editMode, setSvgData, activeBoundaryBoxPath, setActiveBoundaryBoxPath);
  }, 50);

  const panDragGesture = Gesture.Pan();
  panDragGesture.shouldCancelWhenOutside(false);
  panDragGesture.minPointers(1);
  panDragGesture.maxPointers(1);
  panDragGesture.onBegin((event) => panDragEvent(event, "began"))
    .onUpdate((event) => panDragEvent(event, "active"))
    .onEnd((event) => {
      panDragEvent(event, "ended");
      resetBoundaryBox();
    });

  // For scaling of path
  const pinchZoomEvent = throttle((event, state) => {
    handleScaleEvent(event, state, editMode, setSvgData, activeBoundaryBoxPath, setActiveBoundaryBoxPath);
  }, 50);

  const pinchZoomGesture = Gesture.Pinch()
  pinchZoomGesture.onBegin((event) => pinchZoomEvent(event, "began"))
    .onUpdate((event) => pinchZoomEvent(event, "active"))
    .onEnd((event) => {
      pinchZoomEvent(event, "ended");
      resetBoundaryBox();
    });

  // For rotation of path
  const rotateEvent = throttle((event, state) => {
    handleRotateEvent(event, state, editMode, setSvgData, activeBoundaryBoxPath, setActiveBoundaryBoxPath);
  }, 50);


  const rotateGesture = Gesture.Rotation()
  rotateGesture.onBegin((event) => rotateEvent(event, "began"))
    .onUpdate((event) => rotateEvent(event, "active"))
    .onEnd((event) => {
      rotateEvent(event, "ended");
      resetBoundaryBox();
    });

  // Make the context menu appear
  const longPressGesture = Gesture.LongPress()
  longPressGesture.onStart((event) => {
    setMenuPosition({ x: event.x, y: event.y });
  });

  // combine all gestures and initialize
  const composedPanTap = Gesture.Race(doubleTapSelectGesture, longPressGesture, panDragGesture)
  const composedPinch = Gesture.Race(pinchZoomGesture, rotateGesture)
  const composedGesture = Gesture.Simultaneous(panDrawGesture, composedPanTap, composedPinch)
  composedGesture.initialize();

  return (
    <GestureDetector gesture={composedGesture}>
      {children}
    </GestureDetector>
  );

}
