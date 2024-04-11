
import { getBoundaryBox } from "@c/my-boundary-box-paths";
import { getPenOffsetFactorDeviceOrientation, precise } from "@u/helper";
import {
  I_AM_ANDROID,
  I_AM_IOS,
  MetaDataType,
  MyPathDataType,
  PathDataType,
  PenModeType,
  PointType,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  ShapeType,
} from "@u/types";
import { UserPreferencesContext } from "@x/user-preferences";
import { debounce } from "lodash";
import { SetStateAction, useContext, useEffect, useRef } from "react";
import {
  Gesture,
  GestureDetector,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { handleDragEvent } from "./handle-drag-event";
import { handleDrawingEvent } from "./handle-drawing-event";
import { handleRotateEvent } from "./handle-rotate-event";
import { handleScaleEvent } from "./handle-scale-event";
import { handleSelectEvent } from "./handle-select-event";
import myConsole from "@c/my-console-log";
import { getScreenPoint, getSvgPoint } from "@u/coordinates";


type MyGesturesProps = {
  setPenTip: (value: SetStateAction<PointType>) => void,
  penTip: PointType,
  setPenMode: (value: SetStateAction<PenModeType>) => void,
  penMode: PenModeType,
  myPathData: { pathData: PathDataType[]; metaData: MetaDataType; },
  setMyPathData: (value: SetStateAction<MyPathDataType>) => void,
  editMode: boolean,
  setEditMode: (value: SetStateAction<boolean>) => void,
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
  setCanvasOffset: (value: SetStateAction<PointType>) => void,
  canvasOffset: PointType,
  setCanvasScale: (value: SetStateAction<number>) => void,
  canvasScale: number,
  children: React.ReactNode,
};

export const MyGestures = ({
  setPenTip,
  penTip,
  setPenMode,
  penMode,
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
  setCanvasOffset,
  canvasOffset,
  setCanvasScale,
  canvasScale,
  children,
}: MyGesturesProps): React.ReactNode => {

  const { penOffset } = useContext(UserPreferencesContext);
  const adjustedPenOffset = useRef({ x: 0, y: 0 });

  const startPoint = useRef({ x: 0, y: 0 });

  const pan2CanvasOffset = useRef({ ...canvasOffset });
  const pinch2CanvasScale = useRef(canvasScale);

  const penTipRef = useRef({ ...penTip });


  let animationFrameId = null;
  // For all things related to drawing a path
  const handlePanDrawingEvent = async (event: GestureUpdateEvent<PanGestureHandlerEventPayload>, state: string) => {

    if (state === 'began') { // need to measure at begining of each writing event
      // how far pen tip must be from the touch point, set at 0 for now
      //const penOffsetFactor = await getPenOffsetFactorDeviceOrientation();
      adjustedPenOffset.current.x = 0; //(penOffsetFactor?.x || 1) * penOffset.x;
      adjustedPenOffset.current.y = 0; //(penOffsetFactor?.y || 1) * penOffset.y;


    // const adjustSvgPenOffset.current = getSvgPoint(
    //   adjustedPenOffset.current.x,
    //    adjustedPenOffset.current.y,
    //   pinch2CanvasScale.current,
    //   pan2CanvasOffset.current.x,
    //   pan2CanvasOffset.current.y
    // );
  const svgPointCurrent = getSvgPoint(
          event.x, // + adjustedPenOffset.current.x),
          event.y, // + adjustedPenOffset.current.x),
          pinch2CanvasScale.current,
          pan2CanvasOffset.current.x,
          pan2CanvasOffset.current.y
        );

        startPoint.current = { ...svgPointCurrent };
      }

      // get svg point from screen point


      // penTipRef.current = {
      //   x: svgPointCurrent.x - startPoint.current.x + penTipRef.current.x, // + adjustSvgPenOffset.x,
      //   y: svgPointCurrent.y - startPoint.current.y + penTipRef.current.y, // + adjustSvgPenOffset.y


    const updatePenTip = () => {

     const svgPointCurrent = getSvgPoint(
        event.x,
        event.y,
        pinch2CanvasScale.current,
        pan2CanvasOffset.current.x,
        pan2CanvasOffset.current.y
      );

      penTipRef.current = {
        x: svgPointCurrent.x, // - startPoint.current.x + penTipRef.current.x, // + adjustSvgPenOffset.x,
        y: svgPointCurrent.y, // - startPoint.current.y + penTipRef.current.y, // + adjustSvgPenOffset.y
      };

      setPenTip({ ...penTipRef.current });


      startPoint.current = { ...svgPointCurrent };
      // console.log('pen tip', penTipRef.current, 'offset', svgPointOffset, 'start', startPoint.current, 'current', svgPointCurrent, 'adjusted', adjustedPenOffset.current);

      // console.log('scale', canvasScale, 'offset', pan2CanvasOffset)
      // console.log('screen', { x: event.x, y: event.y }, 'svg', penTip);

      if (penMode !== PenModeType.Draw) return;

      handleDrawingEvent(
        penTip,
        penMode,
        event,
        state,
        myPathData,
        setMyPathData,
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
      // }
      // Schedule the next update
      // animationFrameId = requestAnimationFrame(updatePenTip) as any;
    };

    // if (state === 'active') {
    //   // Start the loop
    //   console.log('drawing');
    //   animationFrameId = requestAnimationFrame(updatePenTip) as any;
    // } else if (state === 'ended') {
    //   // Cancel the loop
    //   console.log('drawing ended');
    //   cancelAnimationFrame(animationFrameId as any);
    //   animationFrameId = null;
    // }
  }

  // long press for pen toggle draw mode
  const longPressGesture = Gesture.LongPress();
  longPressGesture.onEnd(() => {
    setPenMode((prev) => prev === PenModeType.Draw ? PenModeType.None : PenModeType.Draw);
  });

  const panDrawGesture = Gesture.Pan();
  panDrawGesture.shouldCancelWhenOutside(false);
  panDrawGesture.minPointers(1);
  panDrawGesture.maxPointers(1);
  panDrawGesture.onBegin((event) => handlePanDrawingEvent(event, "began"))
    .onUpdate((event) => handlePanDrawingEvent(event, "active"))
    .onEnd((event) => handlePanDrawingEvent(event, "ended"));

  // --------------------------------------

  // For paths selection on screen
  const doubleTapSelectGesture = Gesture.Tap();
  doubleTapSelectGesture.minPointers(1);
  doubleTapSelectGesture.numberOfTaps(2).onEnd((event) => {
    handleSelectEvent(event, activeBoundaryBoxPath, setMyPathData);
  });

  // once select mode is activated by double tap, single tap can also select the path
  // handy but creating confusion
      // };

    if (state === 'active') {
      updatePenTip();
    }  // const tapSelectGesture = Gesture.Tap()
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
    handleDragEvent(event, state, editMode, setMyPathData, activeBoundaryBoxPath, setActiveBoundaryBoxPath, canvasScale);
  }, 5, { leading: I_AM_ANDROID, trailing: I_AM_IOS });

  const panDragGesture = Gesture.Pan();
  panDragGesture.shouldCancelWhenOutside(false);
  panDragGesture.minPointers(1);
  panDragGesture.maxPointers(1);
  panDragGesture.onBegin((event) => {
    panDragEvent.cancel();
    panDragEvent(event, "began");
  })
    .onUpdate((event) => panDragEvent(event, "active"))
    .onEnd((event) => {
      panDragEvent(event, "ended");
      resetBoundaryBox();
    });


  const panDrag2Gesture = Gesture.Pan();
  panDrag2Gesture.shouldCancelWhenOutside(false);
  // panDrag2Gesture.enableTrackpadTwoFingerGesture(true);
  panDrag2Gesture.minPointers(2);
  panDrag2Gesture.maxPointers(2);
  panDrag2Gesture.onBegin((event) => {
    // actually it may as well be two finger tap
    startPoint.current = { x: event.x, y: event.y };
  });


  panDrag2Gesture.onUpdate(debounce((event) => {
    const xOffset = (event.x - startPoint.current.x) * canvasScale;
    const yOffset = (event.y - startPoint.current.y) * canvasScale;

    setCanvasOffset((prev) => {
      pan2CanvasOffset.current.x = prev.x - xOffset;
      pan2CanvasOffset.current.y = prev.y - yOffset;
      return { ...pan2CanvasOffset.current };
    });

    startPoint.current = { x: event.x, y: event.y };
  }, 5, { leading: I_AM_ANDROID, trailing: I_AM_IOS }));

  panDrag2Gesture.onEnd(() => {
    setTimeout(() => { // snap prevention
      // save the sketch
      setMyPathData((prev) => ({
        ...prev,
        metaData: {
          ...prev.metaData,
          viewBox: `${pan2CanvasOffset.current.x} ${pan2CanvasOffset.current.y} ${SCREEN_WIDTH * canvasScale} ${SCREEN_HEIGHT * canvasScale}`,
          updatedAt: "",
        },
        updatedAt: new Date().toISOString(),
      }));
    }, 200);
  });


  // For scaling of path
  const pinchZoomEvent = debounce((event, state) => {
    if (activeBoundaryBoxPath) {
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
        if (scale < 0.75) scale = 0.75;
        if (scale > 1.5) scale = 1.5;
        setCanvasScale(scale);
        pinch2CanvasScale.current = event.scale;
      }
    }
  }, 5, { leading: I_AM_ANDROID, trailing: I_AM_IOS });

  const pinchZoomGesture = Gesture.Pinch()
  pinchZoomGesture.onBegin((event) => {
    pinchZoomEvent.cancel();
    pinchZoomEvent(event, "began");
  })
    .onUpdate((event) => pinchZoomEvent(event, "active"))
    .onEnd((event) => {
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



  useEffect(() => {
    panDrag2Gesture.enabled(activeBoundaryBoxPath ? false : true);
    panDrawGesture.enabled(activeBoundaryBoxPath ? false : true);
  }, [activeBoundaryBoxPath]);

  // combine all gestures and initialize
  // const composedPanTap = Gesture.Simultaneous(doubleTapSelectGesture);
  const composedPanDrag = Gesture.Exclusive(panDrawGesture, panDragGesture);
  const composedPinch = Gesture.Simultaneous(Gesture.Race(pinchZoomGesture, rotateGesture), panDrag2Gesture);
  const composedGesture = Gesture.Race(longPressGesture, composedPinch, composedPanDrag, doubleTapSelectGesture);
  // const composedGesture = Gesture.Race( panDrawGesture);
  composedGesture.initialize();

  return (
    <GestureDetector gesture={composedGesture}>
      {children}
    </GestureDetector>
  );

}
