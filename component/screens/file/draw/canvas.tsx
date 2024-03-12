import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Svg from "react-native-svg";
import { createPathdata } from "@u/helper";
import { CANVAS_VIEWBOX, PathDataType, ShapeType } from "@u/types";
import MyPath from "@c/my-path";
import { useCommandEffect } from "./canvas/use-command-effect";
import { SvgDataContext } from "@x/svg-data";
import { defaultShape } from "@u/shapes";
import { useSelectEffect } from "./canvas/use-select-effect";
import { MyGestures } from "./canvas/my-gestures";
import ErrorBoundary from "@c/error-boundary";


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
  const newPathData = () => createPathdata(stroke, strokeWidth, strokeOpacity);

  const [undonePaths, setUndonePaths] = useState([] as PathDataType[]);
  const [currentPath, setCurrentPath] = useState(newPathData());
  const [startTime, setStartTime] = useState(0);
  const [currentShape, setCurrentShape] = useState<ShapeType>(defaultShape);
  const [editMode, setEditMode] = useState(editable);

  const [isLoading, setIsLoading] = useState(true);


  const [activeBoundaryBoxPath, setActiveBoundaryBoxPath] = useState<PathDataType | null>(null)
  // const [boundaryBoxDashoffset, setBoundaryBoxDashoffset] = useState(5);


  // This is be enabled in next version only
  // erasure mode - erasure shape can be square or circle
  // const [erasureMode, setErasureMode] = useState(false);
  // useEffect(() => {
  //   setErasureMode(erasing);
  // }, [erasing])


  useEffect(() => {
    setIsLoading(false);
  }, []);


  useEffect(() => {
    setEditMode(editable);
  }, [editable])



  // get bounding box of selected paths
  useSelectEffect({
    editable,
    svgData,
    setSvgData,
    setIsLoading,
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


  const myGestureProps = {
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
  };

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
            <MyGestures {...myGestureProps}>
              <View style={styles.container}>
                <ErrorBoundary>
                  {/* All drawings were drawn in this canvas with this viewbox
                They need to be edited in this dimension,
                we can save and play on whatever dimension we want, thus using fixed default viewbox*/}
                  <Svg width='100%' height={'100%'} viewBox={CANVAS_VIEWBOX} onLayout={() => setIsLoading(false)}>

                    {svgData.pathData.map((item, _index) => (
                      item.visible
                        ? <MyPath prop={item} keyProp={"completed-" + item.guid} key={item.guid} />
                        : null
                    ))}

                    {currentPath.guid !== "" && (
                      <MyPath prop={currentPath} keyProp={"current"} key={currentPath.guid} />
                    )}


                    {
                      activeBoundaryBoxPath && (
                        <MyPath prop={activeBoundaryBoxPath} keyProp={"selectBoundaryBox"} key={"selectBoundaryBox"} />
                      )
                    }

                  </Svg>
                </ErrorBoundary>
              </View>
            </MyGestures>
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
  flex1: {
    flex: 1,
  },
});

export default SvgCanvas;
