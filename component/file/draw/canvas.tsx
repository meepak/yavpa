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
import { DEFAULT_VIEWBOX, PathDataType } from "@u/types";
import MyPath from "@c/my-path";
import { useCommandEffect } from "./canvas/command-effect";
import { drawingEvent } from "./canvas/drawing-event";
import { SvgDataContext } from "@x/svg-data";
import { svg } from "d3";
// import { saveSvgToFile } from "@u/storage";


type SvgCanvasProps = {
  editable?: boolean;
  erasing?: boolean;
  command?: string;
  forceUpdate?: number;
  // onPathDataChange?: (arg0: PathDataType[]) => void;
  // initialPathData?: PathDataType[];
  strokeWidth?: number;
  stroke?: string;
  strokeOpacity?: number;
  simplifyTolerance?: number;
  d3CurveBasis?: any; // Replace 'any' with the actual type if known
  // viewBox?: string;
};

const SvgCanvas: React.FC<SvgCanvasProps> = (props) => {
  const {
    editable = true,
    erasing = false,
    command = "",
    forceUpdate = 0,
    // onPathDataChange = () => { },
    // initialPathData = [],
    strokeWidth = 2,
    strokeOpacity = 1,
    stroke = "#000000",
    simplifyTolerance = 0,
    d3CurveBasis = null,
    // viewBox = DEFAULT_VIEWBOX,
  } = props;

  const { svgData, setSvgData } = useContext(SvgDataContext);
  const newPathData = () => createPathdata(stroke, strokeWidth, strokeOpacity);

  const [undonePaths, setUndonePaths] = useState([] as PathDataType[]);
  const [completedPaths, setCompletedPaths] = useState(svgData.pathData);
  const [currentPath, setCurrentPath] = useState(newPathData());
  const [startTime, setStartTime] = useState(0);
  // to draw various shapes
  const resetShape = { name: "", start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
  const [currentShape, setCurrentShape] = useState(resetShape);
  // for select mode
  const [editMode, setEditMode] = useState(editable);
  // selectedPaths hold 1 path and it's boundary box path
  // const [selectMode, setSelectMode] = useState(false);
  // const [selectedPathIndex, setSelectedPathIndex] = useState(-1);
  // const [selectedPaths, setSelectedPaths] = useState([] as PathDataType[]);

  // erasure mode - erasure shape can be square or circle 
  const [erasureMode, setErasureMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // console.log('new request');
    if (svgData.metaData.guid !== "") {
      setIsLoading(false);
      setCompletedPaths(() => svgData.pathData);
      svgData.metaData.viewBox = DEFAULT_VIEWBOX; // necessary to be able to draw on
    }
  }, [svgData]);

    useEffect(() => {
    // if (selectMode) return;
    if (completedPaths === svgData.pathData) {
      return
    }
    const updatedSvgData = {
      metaData: svgData.metaData,
      pathData: completedPaths,
    };
    // saveSvgToFile(updatedSvgData);
    setSvgData(updatedSvgData);
  }, [completedPaths]);

  useEffect(() => {
    setEditMode(editable);
  }, [editable])

  useEffect(() => {
    setErasureMode(erasing);
  }, [erasing])

  useCommandEffect(
    command,
    editMode,
    svgData.pathData,
    newPathData,
    completedPaths,
    setCompletedPaths,
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
      editMode,
      erasureMode,
      currentPath,
      setCurrentPath,
      startTime,
      setStartTime,
      newPathData,
      currentShape,
      setCurrentShape,
      completedPaths,
      setCompletedPaths,
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
            <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
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
                <Svg style={styles.svg} viewBox={svgData.metaData.viewBox}>

                  {completedPaths.map((item, _index) => (
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
