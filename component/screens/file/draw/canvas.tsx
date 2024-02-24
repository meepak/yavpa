import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Svg from "react-native-svg";
import {
  GestureDetector,
  Gesture,
  GestureUpdateEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { createPathdata } from "@u/helper";
import { DEFAULT_VIEWBOX, PathDataType, ShapeType } from "@u/types";
import MyPath from "@c/my-path";
import { useCommandEffect } from "./canvas/command-effect";
import { drawingEvent } from "./canvas/drawing-event";
import { SvgDataContext } from "@x/svg-data";
import { defaultShape } from "@u/shapes";


type SvgCanvasProps = {
  editable?: boolean;
  command?: string;
  forceUpdate?: number;
  // initialPathData: PathDataType[];
  strokeWidth?: number;
  stroke?: string;
  strokeOpacity?: number;
  simplifyTolerance?: number;
  d3CurveBasis?: any;
};

const SvgCanvas: React.FC<SvgCanvasProps> = (props) => {
  const {
    editable = true,
    command = "",
    forceUpdate = 0,
    // initialPathData = [],
    strokeWidth = 2,
    strokeOpacity = 1,
    stroke = "#000000",
    simplifyTolerance = 0,
    d3CurveBasis = null,
  } = props;

  const { svgData, setSvgData } = useContext(SvgDataContext);
  const newPathData = () => createPathdata(stroke, strokeWidth, strokeOpacity);

  const [undonePaths, setUndonePaths] = useState([] as PathDataType[]);
  // const [completedPaths, setCompletedPaths] = useState(initialPathData);
  const [currentPath, setCurrentPath] = useState(newPathData());
  const [startTime, setStartTime] = useState(0);
  const [currentShape, setCurrentShape] = useState<ShapeType>(defaultShape);
  const [editMode, setEditMode] = useState(editable);

  const [isLoading, setIsLoading] = useState(true);


  // This is be enabled in next version only
  // const [selectMode, setSelectMode] = useState(false);
  // const [selectedPathIndex, setSelectedPathIndex] = useState(-1);
  // const [selectedPaths, setSelectedPaths] = useState([] as PathDataType[]);
  // erasure mode - erasure shape can be square or circle 
  // const [erasureMode, setErasureMode] = useState(false);


  useEffect(() => {
    setIsLoading(false);
  }, []);


  // useEffect(() => {
  //   if (svgData.pathData === completedPaths) {
  //     console.log('completedPaths isnt new');
  //     return;
  //   }

  //   setSvgData((prev) => ({
  //     metaData: { ...prev.metaData, updated_at: "" },
  //     pathData: completedPaths
  //   }));
  // }, [completedPaths]);





  useEffect(() => {
    setEditMode(editable);
  }, [editable])

  // useEffect(() => {
  //   setErasureMode(erasing);
  // }, [erasing])

  useCommandEffect(
    command,
    editMode,
    // initialPathData,
    newPathData,
    svgData,
    setSvgData,
    undonePaths,
    setUndonePaths,
    setCurrentPath,
    setCurrentShape,
    forceUpdate
  );


  const handleDrawingEvent = (event: GestureUpdateEvent<PanGestureHandlerEventPayload>, state: string) => {
    drawingEvent(
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

  const pan = Gesture.Pan()
  pan.shouldCancelWhenOutside(true);
  pan.onBegin((event) => handleDrawingEvent(event, "began"))
    .onUpdate((event) => handleDrawingEvent(event, "active"))
    .onEnd((event) => handleDrawingEvent(event, "ended"));

  return (
    <View style={styles.container} pointerEvents="box-none">
      {
        isLoading
          ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator
                animating
                size={200}
                color="#0000ff"
              />
            </View>
          )
          : (
            <GestureDetector gesture={pan}>
              <View style={styles.container}>
                {/* All drawings were drawin in this canvas with this viewbox
                They need to be edited in this dimension, 
                we can save and play on whatever dimension we want, thus using fixed default viewbox*/}
                <Svg style={styles.svg} viewBox={DEFAULT_VIEWBOX} onLayout={() => setIsLoading(false)}>

                  {svgData.pathData.map((item, _index) => (
                    item.visible
                      ? <MyPath prop={item} keyProp={"completed"} key={item.guid} />
                      : null
                  ))}

                  {currentPath.guid !== "" && (
                    <MyPath prop={currentPath} keyProp={"current"} key={currentPath.guid} />
                  )}

                  {/* {selectMode && selectedPaths.map((item, _index) => (
                    <MyPath prop={item} keyProp={"selected-" + item.guid} key={item.guid} />
                  ))} */}

                </Svg>
              </View>
            </GestureDetector>
          )
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  svg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default SvgCanvas;
