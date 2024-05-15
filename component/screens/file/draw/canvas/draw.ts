import {
  getPathFromPoints,
  getPointsFromPath,
  getRealPathFromPoints,
  isValidPath,
  pathPointResolution,
} from "@u/helper";
import { getD3CurveBasis, isValidShape, shapeData } from "@u/shapes";
import {
  MY_BLACK,
  type PathDataType,
  type PointType,
  type ShapeType,
  type MyPathDataType,
} from "@u/types";
import * as d3 from "d3-shape";
import * as Crypto from "expo-crypto";
import { type SetStateAction } from "react";
import {
  type GestureStateChangeEvent,
  type GestureUpdateEvent,
  type PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { applyErasure } from "./erase";
import detectShape from "@c/screens/file/draw/canvas/utils/detect-shape";
import detectParallel from "@c/screens/file/draw/canvas/utils/detect-parallel";
import presentPath from "@c/screens/file/draw/canvas/utils/present-path";
import snapPoints from "./utils/snap-points";

export const handleDrawingEvent = (
  penTipRef: React.MutableRefObject<PointType | undefined>,
  event:
    | GestureStateChangeEvent<PanGestureHandlerEventPayload>
    | GestureUpdateEvent<PanGestureHandlerEventPayload>,
  state: string,
  myPathData: MyPathDataType,
  setMyPathData: (value: SetStateAction<MyPathDataType>) => void,
  currentlyDrawingShape: React.MutableRefObject<boolean>,
  canvasScale: number,
  canvasTranslate: PointType,
  editMode: boolean,
  erasureMode: boolean,
  enhancedDrawingMode: boolean,
  snappingMode: boolean,
  existingPaths: React.MutableRefObject<PathDataType[]>,
  currentPath: PathDataType,
  setCurrentPath: (value: SetStateAction<PathDataType>) => void,
  pathTime: React.MutableRefObject<number>,
  newPathData: { (): PathDataType; (): any },
  currentShape: ShapeType,
  setCurrentShape: (value: SetStateAction<ShapeType>) => void,
  simplifyTolerance: number,
  d3CurveBasis: string,
) => {
  if (!editMode || !penTipRef.current) {
    // console.log('editing not allowed....');
    return;
  }

  switch (state) {
    case "began": {
      pathTime.current = Date.now();

      const newPath = {
        ...newPathData(),
        guid: Crypto.randomUUID(),
        path: `M${penTipRef.current?.x},${penTipRef.current?.y}`,
        ...(erasureMode
          ? {
              stroke: MY_BLACK,
              strokeWidth: 2,
              strokeOpacity: 0.5,
              strokeLinecap: "round",
              strokeLinejoin: "round",
              fill: "#FF0000",
              strokeDasharray: "5,5",
              strokeDashoffset: 0,
            }
          : {}),
      };
      setCurrentPath(newPath);

      // Shape takes precedance over path
      currentlyDrawingShape.current = isValidShape(currentShape.name);;
      if (currentlyDrawingShape.current && penTipRef.current !== undefined) {
        setCurrentShape((previous) => ({
          ...previous,
          start: penTipRef.current as any,
        }));
      }

      break;
    }

    case "active": {
      if (penTipRef.current === undefined) {
        break;
      }
      if (currentlyDrawingShape.current) {
        setCurrentShape((previous) => {
          previous.end = penTipRef.current as any;
          return previous;
        });
        const path = shapeData(currentShape);

        setCurrentPath({
          ...currentPath,
          path,
        });
        break;
      }

      if (currentPath.path !== "") {
        let pathExtend = currentPath.path;

        // Erasure paths are always closed
        if (erasureMode) {
          // Remove last Z from path
          pathExtend = pathExtend.endsWith("Z")
            ? pathExtend.slice(0, -1)
            : pathExtend;
        }

        pathExtend = `${pathExtend}L${penTipRef.current.x},${penTipRef.current.y}`;

        if (erasureMode) {
          // Close the path
          pathExtend += "Z";
        }

        // console.log(pathExtend);
        setCurrentPath({
          ...currentPath,
          path: pathExtend,
        });
      }

      break;
    }

    case "ended": {
      if (erasureMode) {
        // Use currentPath as erasure
        const newCompletedPaths = applyErasure(
          currentPath,
          existingPaths.current,
        );
        setMyPathData((previous: MyPathDataType) => ({
          ...previous,
          metaData: { ...previous.metaData, updatedAt: "" },
          pathData: newCompletedPaths,
        }));
        presentPath(currentPath, setCurrentPath).reset();
        return;
      }

      currentPath.time = Date.now() - pathTime.current;
      pathTime.current = 0; // time has been tracked, reset right away

      let pathPoints = getPointsFromPath(
        currentPath.path,
        pathPointResolution.high,
      );
      if (pathPoints.length < 2) {
        return;
      }

      // If it was shape, lets deal with it and get over it
      if (isValidShape(currentShape.name)) {
        // we already have currentShape, nothing needs to be done..

        presentPath(currentPath, setCurrentPath)
          .save(setMyPathData, pathPoints)
          .reset();
        return;
      }

      // Snapping of points enabled
      if (snappingMode) {
        //------------------------lets try to snap the path to existing paths
        pathPoints = snapPoints(
          existingPaths,
          canvasScale,
          canvasTranslate,
          pathPoints,
        );

        // if (pathPoints) {
        //   presentPath(currentPath, setCurrentPath).set(pathPoints);
        // }
      }

      // Enhanced drawing mode
      if (enhancedDrawingMode) {
        console.log("enhanced drawing mode");

        // if(!pathPoints) {
        //   pathPoints = getPointsFromPath(currentPath.path);
        // }
        const validShapePoints = detectShape(pathPoints);
        if (validShapePoints) {
          pathPoints = validShapePoints;
          // presentPath(currentPath, setCurrentPath)
          //   .save(setMyPathData, pathPoints)
          //   .reset();
          // return;
        }
        console.log("valid shape not detected");

        const parallelPathPoints = detectParallel(
          currentPath,
          setCurrentPath,
          existingPaths,
          canvasScale,
        );
        if (parallelPathPoints && parallelPathPoints.length > 0) {
          console.log("parallel path detected");
          pathPoints = parallelPathPoints;
          // presentPath(currentPath, setCurrentPath)
          //   .save(setMyPathData, parallelPathPoints)
          //   .reset();
          // return;
        }
      }

      // else lets continue with usual way,

      if (!pathPoints) {
        console.log("how come pathpoints wasnt set at this point.");
        pathPoints = getPointsFromPath(
          currentPath.path,
          pathPointResolution.high,
        );
      }
      // lets get the path point again, so we can start with simplified path
      // pathPoints = getPointsFromPath(currentPath.path, pathPointResolution.medium);
      // currentPath.path = "";
      const curveBasis: d3.CurveFactoryLineOnly = getD3CurveBasis(
        d3CurveBasis,
        false, // isValidShape(currentShape.name),
      );
      if (curveBasis) {
        currentPath.path = getRealPathFromPoints(pathPoints);
      } else {
        currentPath.path = getPathFromPoints(pathPoints);
      }

      const pp = presentPath(currentPath, setCurrentPath);
      if (isValidPath(currentPath.path)) {
        pp.save(setMyPathData); // do not send path point again...else it will call getPath instead of getRealPath
      }
      pp.reset();
      break;
    }

    default: {
      break;
    }
  }
};
