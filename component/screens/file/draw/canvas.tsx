import React, { useContext, useEffect, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Svg from "react-native-svg";
import { createPathdata } from "@u/helper";
import { CANVAS_HEIGHT, CANVAS_VIEWBOX_DEFAULT, CANVAS_WIDTH, MY_BLACK, PathDataType, PointType, SCREEN_HEIGHT, SCREEN_WIDTH, ShapeType } from "@u/types";
import MyPath from "@c/my-path";
import { useCommandEffect } from "./canvas/use-command-effect";
import { MyPathDataContext } from "@x/svg-data";
import { defaultShape } from "@u/shapes";
import { useSelectEffect } from "./canvas/use-select-effect";
import { MyGestures } from "./canvas/my-gestures";
import ErrorBoundary from "@c/error-boundary";
import MyBoundaryBoxPaths from "@c/my-boundary-box-paths";
import BoundaryBoxIcons from "@c/my-boundary-box-icons";
import MyPathImage from "@c/my-path-image";
import MyPen from "@c/my-pen";


type SvgCanvasProps = {
  selectedPaths?: PathDataType[];
  setSelectedPaths?: React.Dispatch<React.SetStateAction<PathDataType[]>>;
  editable?: boolean;
  erasing?: boolean;
  command?: string;
  forceUpdate?: number;
  strokeWidth?: number;
  stroke?: string;
  strokeOpacity?: number;
  simplifyTolerance?: number;
  d3CurveBasis?: any;
};

const SvgCanvas: React.FC<SvgCanvasProps> = (props) => {
  const {
    editable = true,
    erasing = false,
    command = "",
    forceUpdate = 0,
    strokeWidth = 2,
    strokeOpacity = 1,
    stroke = MY_BLACK,
    simplifyTolerance = 0.0111,
    d3CurveBasis = null,
  } = props;

  const { myPathData, setMyPathData } = useContext(MyPathDataContext);
  const newPathData = () => createPathdata(stroke, strokeWidth, strokeOpacity);

  const [currentPath, setCurrentPath] = useState(newPathData());
  const [startTime, setStartTime] = useState(0);
  const [currentShape, setCurrentShape] = useState<ShapeType>(defaultShape);

  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(editable);
  // erasure mode - erasure shape can be square or circle
  const [erasureMode, setErasureMode] = useState(false);
  // scaleMode is not a realmode, its just an indiactor on how scaling should be done
  const [scaleMode, setScaleMode] = useState<'X' | 'Y' | 'XY'>('XY');


  // holds guid of the path that will be edited with fancy marker
  const [activePathToEdit, setActivePathToEdit] = useState<PathDataType>();
  const [activeBoundaryBoxPath, setActiveBoundaryBoxPath] = useState<PathDataType | null>(null)

  // const [penTip, setPenTip] = useState<PointType | null>(null);
  const penTipRef = useRef<PointType | null>(null);


  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasTranslate, setCanvasTranslate] = useState({ x: 0, y: 0 });
  const [canvasViewBox, setCanvasViewBox] = useState(myPathData.metaData.viewBox || CANVAS_VIEWBOX_DEFAULT);

  useEffect(() => {
    setErasureMode(erasing);
  }, [erasing])


  useEffect(() => {
    setIsLoading(false);
    return () => {
      setMyPathData((prev) => {
        prev.pathData.forEach(
          (item) => item.selected = false);
        return prev;
      });
    }
  }, []);


  // if editable is true switch to writing mode
  // else reset selet mode to allow eslect from start
  useEffect(() => {
    setEditMode(editable);
    if (editable) {
      if (activeBoundaryBoxPath !== null) {
        setActiveBoundaryBoxPath(null);
      }
    }
  }, [editable]);


  // TODO DO NOT STORE VIEWBOX IN METADATA, INSTEAD STORE
  // TOOD CANVAS WIDTH, CANVAS HEIGHT, CANVAS SCALE, CANVAS TRANSLATE
  // TODO AND JUST RECALCULATE VIEWBOX ON THE FLY
  useEffect(() => {
    setCanvasViewBox(`${canvasTranslate.x} ${canvasTranslate.y} ${CANVAS_WIDTH * canvasScale} ${CANVAS_HEIGHT * canvasScale}`);
  }, [canvasTranslate, canvasScale]);

  // get bounding box of selected paths
  useSelectEffect({
    myPathData,
    setMyPathData,
    setEditMode,
    setActiveBoundaryBoxPath,
    stroke,
    strokeWidth,
    strokeOpacity,
    activePathToEdit,
  });



  useCommandEffect(
    command,
    editMode,
    newPathData,
    myPathData,
    setMyPathData,
    setCurrentPath,
    setCurrentShape,
    forceUpdate
  );


  const myGestureProps = {
    activePathToEdit,
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
                color={MY_BLACK}
              />
            </View>
          )
          : (
            <ErrorBoundary>
              <MyGestures {...myGestureProps}>
                <View style={styles.container}>
                  {/* All drawings were drawn in this canvas with this viewbox
They need to be edited in this dimension,
we can save and play on whatever dimension we want, thus using fixed default viewbox*/}
                  <Svg
                    width={'100%'}
                    height={'100%'}
                    viewBox={canvasViewBox}
                    onLayout={() => setIsLoading(false)}
                  >
                    {/* current path is being drawn lets display pen */}
                    {/* {editMode && penTipRef.current && <MyPen tip={penTipRef.current} />} */}

                    {myPathData.imageData?.map((item) => (
                      item.visible
                        ? <MyPathImage prop={item} keyProp={"completed-" + item.guid} key={item.guid} />
                        : null
                    ))}

                    {myPathData.pathData.map((item, _index) => (
                      item.visible && item.guid !== activePathToEdit?.guid
                        ? <MyPath prop={item} keyProp={"completed-" + item.updatedAt} key={item.guid} />
                        : null
                    ))}


                    {currentPath.guid !== "" && currentPath.guid !== activePathToEdit?.guid &&(
                      <MyPath
                        prop={currentPath}
                        keyProp={"current"}
                        key={currentPath.guid}
                      />
                    )}

                    {
                      activePathToEdit &&
                      <MyPath
                        prop={activePathToEdit}
                        keyProp={"current"}
                        key={activePathToEdit.guid}
                        edit={true}
                      />
                    }

                    {
                      activeBoundaryBoxPath  &&
                      <MyBoundaryBoxPaths
                        activeBoundaryBoxPath={activeBoundaryBoxPath}
                      />
                    }

                  </Svg>
                </View>
              </MyGestures>

              {
              activeBoundaryBoxPath  &&
              <BoundaryBoxIcons
                activeBoundaryBoxPath={activeBoundaryBoxPath}
                scaleMode={scaleMode}
                onScaleModeChange={(value:any) => setScaleMode(value)}
                onPathEdit={(p:PathDataType) => {
                  setActivePathToEdit(p);
                  setEditMode(false);
                  setActiveBoundaryBoxPath(null);
                }}
                />
              }

            </ErrorBoundary>
          )
      }
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // overflow: 'hidden',
  },
  flex1: {
    flex: 1,
  },
});

export default SvgCanvas;
