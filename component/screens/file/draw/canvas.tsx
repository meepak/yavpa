import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Svg, { ClipPath, Defs, G, Rect } from "react-native-svg";
import { createPathdata } from "@u/helper";
import {
  CANVAS_HEIGHT,
  CANVAS_VIEWBOX_DEFAULT,
  CANVAS_WIDTH,
  DEFAULT_SIMPLIFY_TOLERANCE,
  DEFAULT_STROKE_OPACITY,
  DEFAULT_STROKE_WIDTH,
  MY_BLACK,
  type PathDataType,
  PathPointType,
  type PointType,
  type ShapeType,
} from "@u/types";
import MyPath from "@c/controls/pure/my-path";
import { useMyPathDataContext } from "@x/svg-data";
import { defaultShape } from "@u/shapes";
import ErrorBoundary from "@c/controls/error-boundary";
import BoundaryBox, { BoundaryBoxIcons } from "@c/boundary-box";
import MyPathImage from "@c/controls/pure/my-path-image";
import MyPen from "@c/controls/pure/my-pen";
import type * as D3Path from "d3-path";
import { MyGestures } from "./canvas/my-gestures";
import { useSelectEffect } from "./canvas/use-select";
import { useCommandEffect } from "./canvas/use-command";
import MyBoundaryBoxPaths from "@c/boundary-box";
import MyPathEditor from "@c/controls/pure/my-path-editor";

type SvgCanvasProperties = {
  selectedPaths?: PathDataType[];
  setSelectedPaths?: React.Dispatch<React.SetStateAction<PathDataType[]>>;
  editable?: boolean;
  erasing?: boolean;
  enhancedDrawing?: boolean;
  snapToNearestPoint?: boolean;
  pathEditing?: boolean;
  command?: string;
  forceUpdate?: number;
  strokeWidth?: number;
  stroke?: string;
  strokeOpacity?: number;
  simplifyTolerance?: number;
  d3CurveBasis?: any;
  canvasScaleProp: number;
  canvasTranslateProp: { x: number; y: number };
};

const SvgCanvas: React.FC<SvgCanvasProperties> = (properties) => {
  const {
    editable = true,
    erasing = false,
    enhancedDrawing = false,
    snapToNearestPoint = false,
    pathEditing = false,
    command = "",
    forceUpdate = 0,
    strokeWidth = DEFAULT_STROKE_WIDTH,
    strokeOpacity = DEFAULT_STROKE_OPACITY,
    stroke = MY_BLACK,
    simplifyTolerance = DEFAULT_SIMPLIFY_TOLERANCE,
    d3CurveBasis = null,
    canvasScaleProp = 1,
    canvasTranslateProp = { x: 0, y: 0 },
  } = properties;

  const { myPathData, setMyPathData } = useMyPathDataContext();
  const newPathData = () => createPathdata(stroke, strokeWidth, strokeOpacity);

  const [currentPath, setCurrentPath] = useState(newPathData());
  const [currentShape, setCurrentShape] = useState<ShapeType>(defaultShape);
  const [editMode, setEditMode] = useState(editable);
  const [enhancedDrawingMode, setEnhancedDrawingMode] =
    useState(enhancedDrawing);
  const [snappingMode, setSnappingMode] = useState(snapToNearestPoint);
  const [pathEditMode, setPathEditMode] = useState(pathEditing);
  const [editedPath, setEditedPath] = useState<typeof D3Path>();
  const currentPathPointType = useRef<PathPointType>(PathPointType.None);
  const [pathEditPoints, setPathEditPoints] = useState<
    Array<{ point: PointType; type: PathPointType }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeBoundaryBoxPath, setActiveBoundaryBoxPath] = useState<
    PathDataType | undefined
  >();

  const [penTip, setPenTip] = useState<PointType | undefined>();
  const penTipRef = useRef<PointType | undefined>();

  const pathTime = useRef<number>(0);
  const currentlyDrawingShape = useRef<boolean>(false);

  const [scaleMode, setScaleMode] = useState<"X" | "Y" | "XY">("XY");

  const [canvasScale, setCanvasScale] = useState(canvasScaleProp);
  const [canvasTranslate, setCanvasTranslate] = useState(canvasTranslateProp);

  const [viewBox, setViewBox] = useState<string>("");

  useEffect(() => {
    setCanvasScale(canvasScaleProp);
    setCanvasTranslate(canvasTranslateProp);
  }, [canvasScaleProp, canvasTranslateProp]);

  // erasure mode - erasure shape can be any shape
  const [erasureMode, setErasureMode] = useState(false);
  useEffect(() => {
    setErasureMode(erasing);
  }, [erasing]);

  useEffect(() => {
    setEnhancedDrawingMode(enhancedDrawing);
  }, [enhancedDrawing]);

  useEffect(() => {
    setSnappingMode(snapToNearestPoint);
  }, [snapToNearestPoint]);

  useEffect(() => {
    setPathEditMode(pathEditing);
  }, [pathEditing]);

  useEffect(() => {
    setIsLoading(false);
    return () => {
      setMyPathData((previous) => {
        for (const item of previous.pathData) {
          item.selected = false;
        }

        return previous;
      });
    };
  }, []);

  // If editable is true switch to writing mode
  // else reset selet mode to allow eslect from start
  useEffect(() => {
    setEditMode(editable);
    if (editable && activeBoundaryBoxPath) {
      setActiveBoundaryBoxPath(undefined);
    }
  }, [editable]);

  useEffect(() => {
    setViewBox(
      `${canvasTranslate.x} ${canvasTranslate.y} ${(myPathData.metaData.canvasWidth ?? CANVAS_WIDTH) * canvasScale} ${(myPathData.metaData.canvasHeight ?? CANVAS_HEIGHT) * canvasScale}`,
    );
  }, [
    canvasTranslate,
    canvasScale,
    myPathData.metaData.canvasWidth,
    myPathData.metaData.canvasHeight,
  ]);

  // Get bounding box of selected paths
  useSelectEffect({
    myPathData,
    setMyPathData,
    setEditMode,
    setActiveBoundaryBoxPath,
    stroke,
    strokeWidth,
    strokeOpacity,
    canvasScale,
    canvasTranslate,
  });

  useCommandEffect(
    command,
    editMode,
    newPathData,
    myPathData,
    setMyPathData,
    setCurrentPath,
    setCurrentShape,
    forceUpdate,
  );

  const myGestureProperties = {
    myPathData,
    setMyPathData,
    currentlyDrawingShape,
    editMode,
    pathEditMode,
    enhancedDrawingMode,
    snappingMode,
    erasureMode,
    currentPath,
    setCurrentPath,
    pathTime,
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
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator animating size={200} color={MY_BLACK} />
        </View>
      ) : (
        <ErrorBoundary>
          <MyGestures {...myGestureProperties}>
            <View style={styles.container}>
              {
                <Svg
                  width={"100%"}
                  height={"100%"}
                  viewBox={viewBox}
                  onLayout={() => {
                    setIsLoading(false);
                  }}
                >
                  <Defs>
                    <ClipPath id="clip">
                      <Rect
                        x="0"
                        y="0"
                        width={myPathData.metaData.canvasWidth ?? CANVAS_WIDTH}
                        height={
                          myPathData.metaData.canvasHeight ?? CANVAS_HEIGHT
                        }
                      />
                    </ClipPath>
                  </Defs>
                  <G ClipPath="url(#clip)">
                    {myPathData.imageData?.map((item) =>
                      item.visible ? (
                        <MyPathImage
                          prop={item}
                          keyProp={"completed-" + item.guid}
                          key={item.guid}
                        />
                      ) : null,
                    )}

                    {myPathData.pathData.map((item, _index) =>
                      item.visible ? (
                        <MyPath
                          prop={item}
                          keyProp={"completed-" + item.updatedAt}
                          key={item.guid}
                          showMarker={item.edit ?? false}
                        />
                      ) : null,
                    )}

                    {currentPath.guid !== "" && (
                      <MyPath
                        prop={currentPath}
                        keyProp={"current"}
                        key={currentPath.guid}
                      />
                    )}

                    {pathEditMode && (
                      <>
                        <MyPen
                          tip={
                            penTip || {
                              x:
                                (CANVAS_WIDTH / 2) * canvasScale +
                                canvasTranslate.x,
                              y:
                                (CANVAS_HEIGHT / 2) * canvasScale +
                                canvasTranslate.y,
                            }
                          }
                        />

                        {myPathData.pathData.map((item, _index) =>
                          item.visible && item.edit ? (
                            <MyPathEditor
                              pathData={item}
                              key={item.guid}
                              keyProp={"completed-" + item.updatedAt}
                            />
                          ) : null,
                        )}
                      </>
                    )}

                    <MyBoundaryBoxPaths
                      activeBoundaryBoxPath={activeBoundaryBoxPath}
                      scaleFactor={canvasScale}
                      translateFactor={canvasTranslate}
                    />
                  </G>
                </Svg>
              }
            </View>
          </MyGestures>

          <BoundaryBoxIcons
            canvasScale={canvasScale}
            canvasTranslate={canvasTranslate}
            activeBoundaryBoxPath={activeBoundaryBoxPath}
            scaleMode={scaleMode}
            onScaleModeChange={(value) => {
              setScaleMode(value);
            }}
            setPathEditMode={(val) => setPathEditMode(val)}
          />
        </ErrorBoundary>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
});

export default SvgCanvas;
