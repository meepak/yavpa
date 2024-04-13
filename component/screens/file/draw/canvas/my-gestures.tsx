
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
import { getPenOffsetFactor, precise } from '@u/helper';


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
  canvasScale: number,
  setCanvasScale: (value: SetStateAction<number>) => void,
  canvasTranslate: PointType,
  setCanvasTranslate: (value: SetStateAction<PointType>) => void,
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
  canvasScale,
  setCanvasScale,
  canvasTranslate,
  setCanvasTranslate,
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

    // const svgPoint = getSvgPoint(event.x / SCREEN_WIDTH, event.y / SCREEN_HEIGHT, canvasScale, canvasTranslate.x, canvasTranslate.y);
    const penTip = {
      x: (event.x * canvasScale + penOffsetRef.current.x + canvasTranslate.x), // * SCREEN_WIDTH,
      y: (event.y * canvasScale + penOffsetRef.current.y + canvasTranslate.y), // * SCREEN_HEIGHT,
    };


    if (state === 'ended') {
      penTipRef.current = null;
      penOffsetRef.current.x = 0;
      penOffsetRef.current.y = 0;
    } else {
      penTipRef.current = { ...penTip };
    }

    handleDrawingEvent(
      {...penTip},
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
    const tapPoint = {
      x: event.x * canvasScale + canvasTranslate.x,
      y: event.y * canvasScale + canvasTranslate.y,
    }
    handleSelectEvent({...tapPoint}, activeBoundaryBoxPath, setMyPathData);
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
    if(!activeBoundaryBoxPath || editMode) return;
    const tapPoint = {
      x: event.x * canvasScale + canvasTranslate.x,
      y: event.y * canvasScale + canvasTranslate.y,
    }
    // if tapPoint is within the boundary box, move the boundary box
    // else allow to draw the free path which will select the paths on the way
    const panTranslatePoint = {
      x: event.translationX * canvasScale,
      y: event.translationY * canvasScale,
    };
    handleDragEvent({...panTranslatePoint}, state, editMode, setMyPathData, activeBoundaryBoxPath, setActiveBoundaryBoxPath);
  }, 5, { leading: I_AM_ANDROID, trailing: I_AM_IOS });

  const panDragGesture = Gesture.Pan();
  panDragGesture.shouldCancelWhenOutside(false);
  panDragGesture.minPointers(1);
  panDragGesture.maxPointers(1);
  panDragGesture.onBegin((event) => {
    // console.log('panDrag began');
    panDragEvent.cancel();
    panDragEvent(event, "began");
  });
  panDragGesture.onUpdate((event) => panDragEvent(event, "active"));
  panDragGesture.onEnd((event) => {
    panDragEvent.flush();
    panDragEvent(event, "ended");
    resetBoundaryBox();
  });

  // two finger canvas pan
  const startPoint = useRef({ x: 0, y: 0 });
  const panDrag2CanvasTranslate = useRef({ x: 0, y: 0 });
  const panDrag2Gesture = Gesture.Pan();
  panDrag2Gesture.shouldCancelWhenOutside(false);
  // panDrag2Gesture.enableTrackpadTwoFingerGesture(true);
  panDrag2Gesture.minPointers(2);
  panDrag2Gesture.maxPointers(2);
  panDrag2Gesture.onBegin((event) => {
    if(activeBoundaryBoxPath) return;
    // actually it may as well be two finger tap
    startPoint.current = { x: event.x, y: event.y };
  });


  const debouncedUpdate = debounce((event: { x: number; y: number; }) => {
    if (activeBoundaryBoxPath) return;
    const xTranslate = (event.x - startPoint.current.x) * canvasScale;
    const yTranslate = (event.y - startPoint.current.y) * canvasScale;

    setCanvasTranslate((prev) => {
      panDrag2CanvasTranslate.current.x = prev.x - xTranslate;
      panDrag2CanvasTranslate.current.y = prev.y - yTranslate;
      return { ...panDrag2CanvasTranslate.current };
    });

    startPoint.current = { x: event.x, y: event.y };
  }, 5, { leading: I_AM_ANDROID, trailing: I_AM_IOS });

  panDrag2Gesture.onUpdate(debouncedUpdate);

  panDrag2Gesture.onEnd(() => {
    debouncedUpdate.cancel();
    // setTimeout(() => { // snap prevention
    startPoint.current = { x: 0, y: 0 };
      // save the sketch
      setMyPathData((prev) => ({
        ...prev,
        metaData: {
          ...prev.metaData,
          viewBox: `${panDrag2CanvasTranslate.current.x} ${panDrag2CanvasTranslate.current.y} ${SCREEN_WIDTH * canvasScale} ${SCREEN_HEIGHT * canvasScale}`,
          updatedAt: "",
        },
        updatedAt: new Date().toISOString(),
      }));
    // }, 200);
  });



  const pinch2CanvasScale = useRef(canvasScale);
  // For scaling of path
  const pinchZoomEvent = debounce((event, state) => {
    if (activeBoundaryBoxPath && !editMode) {
      handleScaleEvent(event, state, editMode, setMyPathData, activeBoundaryBoxPath, setActiveBoundaryBoxPath, scaleMode, setScaleMode);
    } else { // there was no boundary box, so no path was selected
      if (state === 'began') {
        pinch2CanvasScale.current = event.scale;
        // myConsole.log('scaling started', event.scale);
      } else if (state === 'end') {
        pinch2CanvasScale.current = 1;
      } else {
        // myConsole.log('scaling update', event.scale);
        // let do this for canvas scale
        let scale = precise(canvasScale * pinch2CanvasScale.current / event.scale, 2);
        if (scale < 0.25) scale = 0.25;
        if (scale > 2.5) scale = 2.5;
        setCanvasScale(scale);
        pinch2CanvasScale.current = event.scale;
      }
    }
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
  const composedPinch = Gesture.Simultaneous(Gesture.Race(pinchZoomGesture, rotateGesture), panDrag2Gesture);
  const composedGesture = Gesture.Race(composedPinch, composedPanDrag, doubleTapSelectGesture);
  composedGesture.initialize();

  return (
    <GestureDetector gesture={composedGesture}>
      {children}
    </GestureDetector>
  );

}
