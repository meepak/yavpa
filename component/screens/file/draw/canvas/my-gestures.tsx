import { type SetStateAction, useContext, useEffect, useRef } from "react";
import {
  Gesture,
  GestureDetector,
  PinchGestureHandlerEventPayload,
  type GestureUpdateEvent,
  type PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import {
  type PathDataType,
  type MetaDataType,
  type MyPathDataType,
  type ShapeType,
  type PointType,
  I_AM_IOS,
  I_AM_ANDROID,
} from "@u/types";
import { debounce } from "lodash";
import { getBoundaryBox, precise } from "@u/helper";
import { UserPreferencesContext } from "@x/user-preferences";
import { getPenOffsetFactor } from "@u/helper";
import { handleDrawingEvent } from "./draw";
import { handleSelectEvent } from "./select";
import { handleDragEvent } from "./drag";
import { handleScaleEvent } from "./scale";
import { handleRotateEvent } from "./rotate";
import { ToastContext } from "@x/toast-context";

type MyGesturesProperties = {
  myPathData: { pathData: PathDataType[]; metaData: MetaDataType };
  setMyPathData: (value: SetStateAction<MyPathDataType>) => void;
  editMode: boolean;
  pathEditMode: boolean;
  enhancedDrawingMode: boolean;
  snappingMode: boolean;
  erasureMode: boolean;
  currentPath: PathDataType;
  setCurrentPath: (value: SetStateAction<PathDataType>) => void;
  startTime: number;
  setStartTime: (value: SetStateAction<number>) => void;
  newPathData: () => PathDataType;
  currentShape: ShapeType;
  setCurrentShape: (value: SetStateAction<ShapeType>) => void;
  simplifyTolerance: number;
  d3CurveBasis: string;
  activeBoundaryBoxPath: PathDataType | undefined;
  setActiveBoundaryBoxPath: (
    value: SetStateAction<PathDataType | undefined>,
  ) => void;
  scaleMode: "X" | "Y" | "XY";
  setScaleMode: (value: SetStateAction<"X" | "Y" | "XY">) => void;
  canvasScale: number;
  setCanvasScale: (value: SetStateAction<number>) => void;
  canvasTranslate: PointType;
  setCanvasTranslate: (value: SetStateAction<PointType>) => void;
  penTipRef: React.MutableRefObject<PointType | undefined>;
  children: React.ReactNode;
};

export const MyGestures = ({
  myPathData,
  setMyPathData,
  editMode,
  pathEditMode,
  enhancedDrawingMode,
  snappingMode,
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
}: MyGesturesProperties): React.ReactNode => {
  if (pathEditMode) {
    return children;
  }
  if (!myPathData) {
    return null;
  } // Seems unnecessary

  const { showToast } = useContext(ToastContext);
  // N times bigger or smaller than original size
  // N times the width on left or right hand side
  // At 100% scale -- display in middle
  // At 250% scale -- match
  // At 25% scale
  const MAX_PAN_SCALE_FACTOR = 5; // N

  const { usePenOffset, penOffset } = useContext(UserPreferencesContext);
  const penOffsetReference = useRef({ x: 0, y: 0 });

  const existingPaths = useRef<PathDataType[]>([]);

  useEffect(() => {
    existingPaths.current = myPathData.pathData.filter((path) => path.visible);
    existingPaths.current.sort(
      (a, b) =>
        new Date(b.updatedAt as any).getTime() -
        new Date(a.updatedAt as any).getTime(),
    );
  }, [myPathData]);

  // For all things related to drawing a path
  const handlePanDrawingEvent = async (
    event: GestureUpdateEvent<PanGestureHandlerEventPayload>,
    state: string,
  ) => {
    if (state === "began") {
      // Need to measure at begining of each writing event
      const pp = await getPenOffsetFactor();

      if (usePenOffset && pp) {
        penOffsetReference.current.x = (pp?.x || 0) * penOffset.x * canvasScale;
        penOffsetReference.current.y = (pp?.y || 0) * penOffset.y * canvasScale;
      }
    }
    // MyConsole.log('penOffset', penOffsetRef.current);

    // const svgPoint = getSvgPoint(event.x / SCREEN_WIDTH, event.y / SCREEN_HEIGHT, canvasScale, canvasTranslate.x, canvasTranslate.y);

    penTipRef.current = {
      x:
        event.x * canvasScale +
        penOffsetReference.current.x +
        canvasTranslate.x, // * SCREEN_WIDTH,
      y:
        event.y * canvasScale +
        penOffsetReference.current.y +
        canvasTranslate.y, // * SCREEN_HEIGHT,
    };

    // console.log("ACTIVE penTipRef.current", penTipRef.current, state);
    // PenTipRef.current = { ...penTip as any};

    handleDrawingEvent(
      penTipRef,
      event,
      state,
      myPathData,
      setMyPathData,
      canvasScale,
      canvasTranslate,
      editMode,
      erasureMode,
      enhancedDrawingMode,
      snappingMode,
      existingPaths,
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

    if (state === "ended") {
      // PenTipRef.current = null;
      penOffsetReference.current.x = 0;
      penOffsetReference.current.y = 0;
    }
  };

  const panDrawGesture = Gesture.Pan();
  panDrawGesture.shouldCancelWhenOutside(false);
  panDrawGesture.minPointers(1);
  panDrawGesture.maxPointers(1);
  panDrawGesture
    .onBegin(async (event) => handlePanDrawingEvent(event, "began"))
    .onUpdate(async (event) => handlePanDrawingEvent(event, "active"))
    .onEnd(async (event) => handlePanDrawingEvent(event, "ended"));

  // --------------------------------------

  // For paths selection on screen
  const doubleTapSelectGesture = Gesture.Tap();
  doubleTapSelectGesture.numberOfTaps(2).onEnd((event) => {
    const tapPoint = {
      x: event.x * canvasScale + canvasTranslate.x,
      y: event.y * canvasScale + canvasTranslate.y,
    };
    handleSelectEvent(
      { ...tapPoint },
      activeBoundaryBoxPath,
      setMyPathData,
      true,
    );
  });

  // Once select mode is activated by double tap, single tap can also select the path
  const tapSelectGesture = Gesture.Tap();
  tapSelectGesture.numberOfTaps(1).onEnd((event) => {
    if (!activeBoundaryBoxPath) {
      return;
    }

    const tapPoint = {
      x: event.x * canvasScale + canvasTranslate.x,
      y: event.y * canvasScale + canvasTranslate.y,
    };
    handleSelectEvent(
      { ...tapPoint },
      activeBoundaryBoxPath,
      setMyPathData,
      false,
    );
  });

  //--------------------------------------
  const resetBoundaryBox = () => {
    const selectedPaths = myPathData.pathData.filter(
      (item) => item.selected === true,
    );
    const bBoxPath = getBoundaryBox(
      selectedPaths,
      canvasScale,
      canvasTranslate,
    );
    setActiveBoundaryBoxPath(bBoxPath);
  };

  // For moving paths on screen
  const panDragEvent = debounce(
    (event, state) => {
      if (!activeBoundaryBoxPath || editMode) {
        return;
      }

      // const tapPoint = {
      //   x: event.x * canvasScale + canvasTranslate.x,
      //   y: event.y * canvasScale + canvasTranslate.y,
      // };
      // If tapPoint is within the boundary box, move the boundary box
      // else allow to draw the free path which will select the paths on the way
      const panTranslatePoint = {
        x: event.translationX * canvasScale,
        y: event.translationY * canvasScale,
      };
      handleDragEvent(
        { ...panTranslatePoint },
        state,
        editMode,
        setMyPathData,
        activeBoundaryBoxPath,
        setActiveBoundaryBoxPath,
      );
    },
    5,
    { leading: I_AM_ANDROID, trailing: I_AM_IOS },
  );

  const panDragGesture = Gesture.Pan();
  panDragGesture.shouldCancelWhenOutside(false);
  panDragGesture.minPointers(1);
  panDragGesture.maxPointers(1);
  panDragGesture.onBegin((event) => {
    // Console.log('panDrag began');
    panDragEvent.cancel();
    panDragEvent(event, "began");
  });
  panDragGesture.onUpdate((event) => panDragEvent(event, "active"));
  panDragGesture.onEnd((event) => {
    panDragEvent.flush();
    panDragEvent(event, "ended");
    resetBoundaryBox();
  });

  // Two finger canvas pan
  const startPoint = useRef({ x: 0, y: 0 });
  const panDrag2CanvasTranslate = useRef({ x: 0, y: 0 });
  const panDrag2Gesture = Gesture.Pan();
  panDrag2Gesture.shouldCancelWhenOutside(false);
  // panDrag2Gesture.cancelsTouchesInView(true);
  // panDrag2Gesture.enableTrackpadTwoFingerGesture(true);
  panDrag2Gesture.minPointers(2);
  panDrag2Gesture.maxPointers(2);
  panDrag2Gesture.averageTouches(true);
  panDrag2Gesture.onBegin((event) => {
    if (activeBoundaryBoxPath) {
      return;
    }
    panDragGesture.enabled(false);
    pinchZoomGesture.enabled(false);
    // Actually it may as well be two finger tap
    startPoint.current = { x: event.x, y: event.y };
  });

  const debouncedUpdate = debounce(
    (event: GestureUpdateEvent<PanGestureHandlerEventPayload>) => {
      if (activeBoundaryBoxPath) {
        return;
      }
      if (event.numberOfPointers !== 2) {
        return;
      }

      const xTranslate = (event.x - startPoint.current.x) * canvasScale;
      const yTranslate = (event.y - startPoint.current.y) * canvasScale;

      setCanvasTranslate((previous) => {
        panDrag2CanvasTranslate.current.x = previous.x - xTranslate;
        panDrag2CanvasTranslate.current.y = previous.y - yTranslate;
        return { ...panDrag2CanvasTranslate.current };
      });

      startPoint.current = { x: event.x, y: event.y };
    },
    5,
    { leading: I_AM_ANDROID, trailing: I_AM_IOS },
  );

  panDrag2Gesture.onUpdate(debouncedUpdate);

  panDrag2Gesture.onEnd(() => {
    debouncedUpdate.cancel();
    // SetTimeout(() => { // snap prevention
    startPoint.current = { x: 0, y: 0 };
    // Save the sketch
    // console.log("translate ended -->" + pinch2CanvasScale.current);

    setMyPathData((previous) => ({
      ...previous,
      metaData: {
        ...previous.metaData,
        canvasScale: canvasScale,
        canvasTranslateX: canvasTranslate.x,
        canvasTranslateY: canvasTranslate.y,
        updatedAt: "",
      },
      updatedAt: new Date().toISOString(),
    }));
    panDrag2CanvasTranslate.current.x = 0;
    panDrag2CanvasTranslate.current.y = 0;
    // }, 200);
    panDragGesture.enabled(true);
  });

  const pinch2CanvasScale = useRef(canvasScale);
  // For scaling of path
  const pinchZoomEvent = debounce(
    (
      event: GestureUpdateEvent<PinchGestureHandlerEventPayload>,
      state: string,
    ) => {
      if (activeBoundaryBoxPath && !editMode) {
        const focalPoint = {
          x: event.focalX * canvasScale + canvasTranslate.x,
          y: event.focalY * canvasScale + canvasTranslate.y,
        };
        handleScaleEvent(
          event,
          state,
          editMode,
          setMyPathData,
          activeBoundaryBoxPath,
          setActiveBoundaryBoxPath,
          scaleMode,
          setScaleMode,
          focalPoint,
        );
        return;
      }
      // There was no boundary box, so no path was selected
      if (state === "began") {
        panDrag2Gesture.enabled(false);
        pinch2CanvasScale.current = canvasScale;
        // console.log("zscaling started", canvasScale, event.scale);
        return;
      } else if (state === "end") {
        // console.log("scaling ended -->" + pinch2CanvasScale.current);
        setMyPathData((previous) => ({
          ...previous,
          metaData: {
            ...previous.metaData,
            canvasScale: canvasScale,
            canvasTranslateX: canvasTranslate.x,
            canvasTranslateY: canvasTranslate.y,
            updatedAt: "",
          },
          updatedAt: new Date().toISOString(),
        }));

        panDrag2Gesture.enabled(true);

        pinchZoomGesture.enabled(true);
        // pinch2CanvasScale.current = 1;
        return;
      } else {
        if (event.numberOfPointers !== 2) {
          return;
        }
        // let do this for canvas scale
        let newScale = pinch2CanvasScale.current / event.scale;
        // myConsole.log("scaling update", event.scale, scale);

        // The maximum allowable scale is 2.5 and minimum is 0.25
        if (newScale < 0.25) {
          newScale = 0.25;
        }

        if (newScale > 2.5) {
          newScale = 2.5;
        }

        showToast("Scaled at " + precise(newScale) + '%');
        setCanvasScale(newScale);
      }
    },
    5,
    { leading: I_AM_ANDROID, trailing: I_AM_IOS },
  );

  const pinchZoomGesture = Gesture.Pinch();
  pinchZoomGesture.onBegin((event) => {
    pinchZoomEvent.cancel();
    pinchZoomEvent(event, "began");
  });
  pinchZoomGesture.onUpdate((event) => pinchZoomEvent(event, "active"));
  pinchZoomGesture.onEnd((event) => {
    pinchZoomEvent.flush();
    pinchZoomEvent(event, "ended");
    resetBoundaryBox();
    setScaleMode("XY");
  });

  // For rotation of path
  const rotateEvent = debounce(
    (event, state) => {
      const pivot = {
        x: event.anchorX * canvasScale + canvasTranslate.x,
        y: event.anchorY * canvasScale + canvasTranslate.y,
      };
      handleRotateEvent(
        event,
        state,
        editMode,
        setMyPathData,
        activeBoundaryBoxPath,
        setActiveBoundaryBoxPath,
        pivot,
      );
    },
    5,
    { leading: I_AM_ANDROID, trailing: I_AM_IOS },
  );

  const rotateGesture = Gesture.Rotation();
  rotateGesture
    .onBegin((event) => {
      rotateEvent.cancel();
      rotateEvent(event, "began");
    })
    .onUpdate((event) => rotateEvent(event, "active"))
    .onEnd((event) => {
      rotateEvent(event, "ended");
      resetBoundaryBox();
    });

  // Combine all gestures and initialize
  const composedPanDrag = Gesture.Simultaneous(panDrawGesture, panDragGesture);
  const composedPinch = Gesture.Simultaneous(pinchZoomGesture, panDrag2Gesture);
  const composedSelect = Gesture.Exclusive(
    doubleTapSelectGesture,
    tapSelectGesture,
  );
  const composedGesture = Gesture.Race(
    composedPinch,
    composedPanDrag,
    composedSelect,
    rotateGesture,
  );
  composedGesture.initialize();

  return (
    <GestureDetector gesture={composedGesture}>{children}</GestureDetector>
  );
};
