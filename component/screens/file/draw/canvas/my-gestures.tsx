
import { SetStateAction, useContext, useRef, useState } from "react";
import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import {
  PathDataType,
  MetaDataType,
  MyPathDataType,
  ShapeType,
  PointType,
  I_AM_IOS,
  I_AM_ANDROID,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from "@u/types";
import { handleDrawingEvent } from "./handle-drawing-event";
import { handleSelectEvent } from "./handle-select-event";
import { handleDragEvent } from "./handle-drag-event";
import { handleScaleEvent } from "./handle-scale-event";
import { handleRotateEvent } from "./handle-rotate-event";
import { debounce } from "lodash";
import { getBoundaryBox } from "@c/my-boundary-box-paths";
import { UserPreferencesContext } from "@x/user-preferences";
import { getPenOffsetFactor } from '@u/helper';
import myConsole from "@c/my-console-log";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import { getSvgPoint } from "@u/coordinates";


type MyGesturesProps = {
  myPathData: { pathData: PathDataType[]; metaData: MetaDataType; },
  setMyPathData: (value: SetStateAction<MyPathDataType>) => void,
  editMode: boolean,
  erasureMode: boolean
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
  scaleMode: 'X' | 'Y' | 'XY',
  setScaleMode: (value: SetStateAction<'X' | 'Y' | 'XY'>) => void,
  penTipRef: React.MutableRefObject<PointType | null>,
  children: React.ReactNode,
};

export const MyGestures = ({
  myPathData,
  setMyPathData,
  editMode,
  erasureMode,
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
  scaleMode,
  setScaleMode,
  penTipRef,
  children,
}: MyGesturesProps): React.ReactNode => {

  const { penOffset } = useContext(UserPreferencesContext);
  const penOffsetRef = useRef({ x: 0, y: 0 });

  // For all things related to drawing a path
  const handlePanDrawingEvent = async (event: GestureUpdateEvent<PanGestureHandlerEventPayload>, state: string) => {

    if (state === 'began') { // need to measure at begining of each writing event
      const pp = await getPenOffsetFactor();

      penOffsetRef.current.x = (pp?.x || 0) * penOffset.x;
      penOffsetRef.current.y = (pp?.y || 0) * penOffset.y;
    }

    // myConsole.log('penOffset', penOffsetRef.current);

    const svgPoint = getSvgPoint(event.x / SCREEN_WIDTH, event.y / SCREEN_HEIGHT, 1, 0, 0);
    const penTip = {
      x: svgPoint.x * SCREEN_WIDTH,  //+ penOffsetRef.current.x,
      y: svgPoint.y * SCREEN_HEIGHT, // + penOffsetRef.current.y,
    };


    if (state === 'ended') {
      penTipRef.current = null;
      penOffsetRef.current.x = 0;
      penOffsetRef.current.y = 0;
    } else {
      penTipRef.current = { ...penTip };
    }

    handleDrawingEvent(
      penTip,
      event,
      state,
      myPathData,
      setMyPathData,
      editMode,
      erasureMode,
      currentPath,
      setCurrentPath,
      startTime,
      setStartTime,
      newPathData,
      currentShape,
      setCurrentShape,
      simplifyTolerance,
      d3CurveBasis,
    );
  }

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
    handleSelectEvent(event, activeBoundaryBoxPath, setMyPathData);
  });

  // once select mode is activated by double tap, single tap can also select the path
  // handy but creating confusion
  // const tapSelectGesture = Gesture.Tap()
  // tapSelectGesture.numberOfTaps(1).onEnd((event) => {
  //   if(!activeBoundaryBoxPath) return;
  //   // handleSelectEvent(event, activeBoundaryBoxPath, setMyPathData);
  //   myConsole.log('tapped');
  // });

  //--------------------------------------
  const resetBoundaryBox = () => {
    const selectedPaths = myPathData.pathData.filter((item) => item.selected === true);
    const bBoxPath = getBoundaryBox(selectedPaths);
    setActiveBoundaryBoxPath(bBoxPath);
  }

  // For moving paths on screen
  const panDragEvent = debounce((event, state) => {
    handleDragEvent(event, state, editMode, setMyPathData, activeBoundaryBoxPath, setActiveBoundaryBoxPath);
  }, 5, { leading: I_AM_ANDROID, trailing: I_AM_IOS });

  const panDragGesture = Gesture.Pan();
  panDragGesture.shouldCancelWhenOutside(false);
  panDragGesture.minPointers(1);
  panDragGesture.maxPointers(1);
  panDragGesture.onBegin((event) => {
    panDragEvent.cancel();
    panDragEvent(event, "began");
  });
  panDragGesture.onUpdate((event) => panDragEvent(event, "active"));
  panDragGesture.onEnd((event) => {
    panDragEvent.flush();
    panDragEvent(event, "ended");
    resetBoundaryBox();
  });

  // For scaling of path
  const pinchZoomEvent = debounce((event, state) => {
    handleScaleEvent(event, state, editMode, setMyPathData, activeBoundaryBoxPath, setActiveBoundaryBoxPath, scaleMode, setScaleMode);
  }, 5, { leading: I_AM_ANDROID, trailing: I_AM_IOS });

  const pinchZoomGesture = Gesture.Pinch()
  pinchZoomGesture.onBegin((event) => {
    pinchZoomEvent.cancel();
    pinchZoomEvent(event, "began");
  });
  pinchZoomGesture.onUpdate((event) => pinchZoomEvent(event, "active"))
  pinchZoomGesture.onEnd((event) => {
      pinchZoomEvent.flush();
      pinchZoomEvent(event, "ended");
      resetBoundaryBox();
      setScaleMode('XY');
    });

  // For rotation of path
  const rotateEvent = debounce((event, state) => {
    handleRotateEvent(event, state, editMode, setMyPathData, activeBoundaryBoxPath, setActiveBoundaryBoxPath);
  }, 5, { leading: I_AM_ANDROID, trailing: I_AM_IOS });


  const rotateGesture = Gesture.Rotation()
  rotateGesture.onBegin((event) => {
    rotateEvent.cancel();
    rotateEvent(event, "began");
  })
    .onUpdate((event) => rotateEvent(event, "active"))
    .onEnd((event) => {
      rotateEvent(event, "ended");
      resetBoundaryBox();
    });


  // combine all gestures and initialize
  // const composedPanTap = Gesture.Simultaneous(doubleTapSelectGesture);
  const composedPanDrag = Gesture.Simultaneous(panDrawGesture, panDragGesture);
  const composedPinch = Gesture.Race(pinchZoomGesture, rotateGesture);
  const composedGesture = Gesture.Race(composedPinch, composedPanDrag, doubleTapSelectGesture);
  composedGesture.initialize();

  return (
    <GestureDetector gesture={composedGesture}>
      {children}
    </GestureDetector>
  );

}
