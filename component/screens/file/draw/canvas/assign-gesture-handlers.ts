import { 
    Gesture, 
    GestureStateChangeEvent, 
    GestureUpdateEvent, 
    PanGestureHandlerEventPayload, 
    PinchGestureHandlerEventPayload, 
    RotationGestureHandlerEventPayload, 
    TapGestureHandlerEventPayload 
} from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
// import { handleDoubleTapSelectEvent } from "./____handle-double-tap-select-event";
import { handleDrawingEvent } from "./handle-drawing-event";
// import { handleSelectedPathRotate } from "./handle-selected-path-rotate-event";
// import { handleSelectedPathScale } from "./handle-selected-path-scale-event";
// import { handleTranslateEvent } from "./handle-translate-event";
import { PathDataType, MetaDataType, SvgDataType, ShapeType } from "@u/types";
import { SetStateAction } from "react";



export const assignGestureHandlers = (
    externalGesture: any,
    svgData: { pathData: PathDataType[]; metaData: MetaDataType; },
    setSvgData: { (value: SetStateAction<SvgDataType>): void; (value: SetStateAction<SvgDataType>): void; },
    editMode: boolean,
    currentPath: PathDataType,
    setCurrentPath: (value: SetStateAction<PathDataType>) => void,
    startTime: number,
    setStartTime: (value: SetStateAction<number>) => void,
    newPathData: { (): PathDataType; (): any; },
    currentShape: ShapeType,
    setCurrentShape: (value: SetStateAction<ShapeType>) => void,
    simplifyTolerance: number,
    d3CurveBasis: string,
    selectedPaths: PathDataType[],
    setSelectedPaths: (value: SetStateAction<PathDataType[]>) => void,
    activeBoundaryBoxPath: PathDataType | null,
    setActiveBoundaryBoxPath: (value: SetStateAction<PathDataType | null>) => void,
) => {

const handlePanDrawingEvent = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload> | GestureUpdateEvent<PanGestureHandlerEventPayload>, state: string) => {
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

  const handleTapSelectEvent = (event: GestureStateChangeEvent<TapGestureHandlerEventPayload>, state: string) => {
    // handleDoubleTapSelectEvent(
    //   event,
    //   svgData,
    //   selectedPaths,
    //   setSelectedPaths,
    // );
  }

  const handlePanTranslateEvent = (event: GestureStateChangeEvent<PanGestureHandlerEventPayload> | GestureUpdateEvent<PanGestureHandlerEventPayload>, state: string) => {
    if (!activeBoundaryBoxPath || editMode) return;
    // handleTranslateEvent(
    //   event,
    //   state,
    //   selectedPaths,
    //   setSelectedPaths,
    //   activeBoundaryBoxPath,
    //   setActiveBoundaryBoxPath,
    // );
  };


  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const handlePinchScaleEvent = (event: GestureStateChangeEvent<PinchGestureHandlerEventPayload> | GestureUpdateEvent<PinchGestureHandlerEventPayload>, state: string) => {
    if (!activeBoundaryBoxPath || editMode) return;
    // handleSelectedPathScale(
    //   event,
    //   state,
    //   scale,
    //   savedScale,
    //   setSvgData,
    //   activeBoundaryBoxPath,
    //   setActiveBoundaryBoxPath,
    // )
  }

  const handleRotateEvent = (event: GestureStateChangeEvent<RotationGestureHandlerEventPayload> | GestureUpdateEvent<RotationGestureHandlerEventPayload>, state: string) => {
    if (!activeBoundaryBoxPath || editMode) return;
    // handleSelectedPathRotate(event, state)
  }

  const panForDrawing = Gesture.Pan();
  panForDrawing.shouldCancelWhenOutside(false);
  panForDrawing.minPointers(1);
  panForDrawing.maxPointers(1);
  panForDrawing.onBegin((event) => handlePanDrawingEvent(event, "began"))
    .onUpdate((event) => handlePanDrawingEvent(event, "active"))
    .onEnd((event) => handlePanDrawingEvent(event, "ended"));

  // const doubleTapForSelect = Gesture.Tap()
  // doubleTapForSelect.numberOfTaps(2).onEnd((event) => handleTapSelectEvent(event, "double-tapped"));

  // const panForSelectedTranslate = Gesture.Pan()
  // panForSelectedTranslate.minPointers(1);
  // panForSelectedTranslate.maxPointers(1);
  // panForSelectedTranslate.shouldCancelWhenOutside(false);
  // panForSelectedTranslate.onBegin((event) => handlePanTranslateEvent(event, "began"))
  //   .onUpdate((event) => handlePanTranslateEvent(event, "active"))
  //   .onEnd((event) => handlePanTranslateEvent(event, "ended"));


  // const pinchForSelectedScale = Gesture.Pinch();
  // pinchForSelectedScale.onBegin((event) => handlePinchScaleEvent(event, "began"))
  //   .onUpdate((event) => handlePinchScaleEvent(event, "active"))
  //   .onEnd((event) => handlePinchScaleEvent(event, "ended"));

  // const rotateForSelectedRotation = Gesture.Rotation();
  // rotateForSelectedRotation.onBegin((event) => handleRotateEvent(event, "began"))
  //   .onUpdate((event) => handleRotateEvent(event, "active"))
  //   .onEnd((event) => handleRotateEvent(event, "ended"));

  // const longPressForMenu = Gesture.LongPress();


  if(externalGesture.pinch) { //probably not simultaneuos
    // pinchForSelectedScale.shouldCancelWhenOutside(false);
    // pinchForSelectedScale.simultaneousWithExternalGesture(externalGesture.pinch);
    // pinchForSelectedScale.blocksExternalGesture(externalGesture.pinch);
  }
  if(externalGesture.pan) { //probably not simultanueous
    // panForSelectedTranslate.blocksExternalGesture(externalGesture.pan);
  }

  const composedGesture = Gesture.Simultaneous(
    panForDrawing,
    // doubleTapForSelect,
    // panForSelectedTranslate,
    // pinchForSelectedScale,
    // rotateForSelectedRotation,
    // longPressForMenu
    );


  // return composedGesture;
  return panForDrawing;
  }
