import React, { useContext, useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, NativeMethods } from "react-native";
import Svg, { Shape } from "react-native-svg";
import {
  GestureDetector,
} from "react-native-gesture-handler";
import { createPathdata } from "@u/helper";
import { CANVAS_VIEWBOX, PathDataType, ShapeType } from "@u/types";
import MyPath from "@c/my-path";
import { useCommandEffect } from "./canvas/use-command-effect";
import { SvgDataContext } from "@x/svg-data";
import { defaultShape, shapeData } from "@u/shapes";
import { useSelectEffect } from "./canvas/use-select-effect";
import { assignGestureHandlers } from "./canvas/assign-gesture-handlers";
import { GestureResponderEvent } from "react-native-modal";


type SvgCanvasProps = {
  selectedPaths?: PathDataType[];
  setSelectedPaths?: React.Dispatch<React.SetStateAction<PathDataType[]>>;
  zoom?: number;
  editable?: boolean;
  command?: string;
  forceUpdate?: number;
  strokeWidth?: number;
  stroke?: string;
  strokeOpacity?: number;
  simplifyTolerance?: number;
  d3CurveBasis?: any;
  externalGesture?: any;
};

const SvgCanvas: React.FC<SvgCanvasProps> = (props) => {
  const {
    selectedPaths = [],
    setSelectedPaths = () => { },
    zoom = 1,
    editable = true,
    command = "",
    forceUpdate = 0,
    strokeWidth = 2,
    strokeOpacity = 1,
    stroke = "#000000",
    simplifyTolerance = 0.0111,
    d3CurveBasis = null,
    externalGesture: externalGesture = null,
  } = props;

  const { svgData, setSvgData } = useContext(SvgDataContext);
  const [unselectedPaths, _setUnselectedPaths] = useState([] as PathDataType[]);
  const newPathData = () => createPathdata(stroke, strokeWidth, strokeOpacity);

  const [undonePaths, setUndonePaths] = useState([] as PathDataType[]);
  const [currentPath, setCurrentPath] = useState(newPathData());
  const [startTime, setStartTime] = useState(0);
  const [currentShape, setCurrentShape] = useState<ShapeType>(defaultShape);
  const [editMode, setEditMode] = useState(editable);

  const [isLoading, setIsLoading] = useState(true);

  const [activeBoundaryBoxPath, setActiveBoundaryBoxPath] = useState<PathDataType | null>(null)
  // const [boundaryBoxDashoffset, setBoundaryBoxDashoffset] = useState(5);
  // const svgRef = useRef<Shape<any> & NativeMethods>(null);
  // const  myPathRef = useRef<MyPath>();

  // To ensure paths can't be altered in unselected paths, it can only be used to store stuff from svg data
  const setUnselectedPaths = (newPaths: PathDataType[]) => {
    _setUnselectedPaths(prevPaths => {
      const pathsToAdd = newPaths.filter(newPath => !prevPaths.find(prevPath => prevPath.guid === newPath.guid));
      const pathsToRemove = prevPaths.filter(prevPath => !newPaths.find(newPath => newPath.guid === prevPath.guid));
      return [...prevPaths.filter(path => !pathsToRemove.includes(path)), ...pathsToAdd];
    });
  };

  // This is be enabled in next version only
  // erasure mode - erasure shape can be square or circle 
  // const [erasureMode, setErasureMode] = useState(false);
  // useEffect(() => {
  //   setErasureMode(erasing);
  // }, [erasing])



  // get bounding box of selected paths
  useSelectEffect({
    editable,
    svgData,
    setSvgData,
    setIsLoading,
    selectedPaths,
    setSelectedPaths,
    setUnselectedPaths,
    setEditMode,
    setActiveBoundaryBoxPath,
    stroke,
    strokeWidth,
    strokeOpacity,
  });


  useCommandEffect(
    command,
    editMode,
    newPathData,
    svgData,
    setSvgData,
    undonePaths,
    setUndonePaths,
    setCurrentPath,
    setCurrentShape,
    forceUpdate
  );


  const composedGesture = assignGestureHandlers(
    externalGesture,
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
    selectedPaths,
    setSelectedPaths,
    activeBoundaryBoxPath,
    setActiveBoundaryBoxPath,
  );

  // TODO just mark the path as being selected and move the logic to create bounding box and rest inside path itself
  const handlePathPress = (event: GestureResponderEvent, myPath: MyPath, bBoxData: PathDataType) => {
    console.log('path pressed', myPath.props.prop.guid);


    setActiveBoundaryBoxPath(bBoxData);
    myPath.props.prop.text = { value: 'from outside, heelooo boundary box', above: -4 };
    myPath.forceUpdate();
    setEditMode(false);
  }

  return (
    <View style={styles.container}>
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
            <GestureDetector gesture={composedGesture}>
              <View style={styles.flex1}>
                {/* EXCEPT DEFAULT ONES I CHOSE TWO PUT AS AN EXAMPLE BY DEFAULT ALSO NEEDS CUSTOM  
                All drawings were drawn in this canvas with this viewbox
                They need to be edited in this dimension, 
                we can save and play on whatever dimension we want, thus using fixed default viewbox*/}
                {/* <ErrorBoundary identifier="Drawing Canvas"> */}
                <Svg
                  width='100%'
                  height={'100%'}
                  viewBox={CANVAS_VIEWBOX}
                  onLayout={() => setIsLoading(false)}
                >
                  {unselectedPaths.map((item, _index) => (
                    item.visible
                      ? <MyPath
                        onPress={handlePathPress}
                        prop={item}
                        keyProp={"completed-" + item.guid}
                        key={item.guid}
                        startResponder={true} />
                      : null
                  ))}

                  {selectedPaths.map((item, _index) => (
                    item.visible
                      ? <MyPath
                        onPress={handlePathPress}
                        prop={item}
                        keyProp={"selected-" + item.guid}
                        key={item.guid}
                        startResponder={true} />
                      : null
                  ))}

                  {currentPath.guid !== "" && (
                    <MyPath
                      onPress={handlePathPress}
                      prop={currentPath}
                      keyProp={"current"}
                      key={currentPath.guid} />
                  )}

                  {
                    activeBoundaryBoxPath && (
                      <MyPath
                        prop={activeBoundaryBoxPath}
                        keyProp={"selectBoundaryBox"}
                        key={"selectBoundaryBox"}
                        startResponder={true} />
                    )
                  }

                </Svg>
                {/* </ErrorBoundary> */}
              </View>
            </GestureDetector>
          )
      }
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // overflow: 'hidden'
  },
  flex1: {
    flex: 1,
    // overflow: 'hidden'
  },
});

export default SvgCanvas;
