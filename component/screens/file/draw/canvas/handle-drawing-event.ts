// Import { applyErasure } from "@u/erasure";
import myConsole from "@c/my-console-log";
import {
  getPathFromPoints,
  getPathLength,
  getPointsFromPath,
  isValidPath,
  precise,
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
import simplify from "simplify-js";
import { applyErasure } from "./apply-erasure";

export const handleDrawingEvent = (
  penTipRef: React.MutableRefObject<PointType>,
  event:
    | GestureStateChangeEvent<PanGestureHandlerEventPayload>
    | GestureUpdateEvent<PanGestureHandlerEventPayload>,
  state: string,
  myPathData: MyPathDataType,
  setMyPathData: (value: SetStateAction<MyPathDataType>) => void,
  editMode: boolean,
  erasureMode: boolean,
  currentPath: PathDataType,
  setCurrentPath: (value: SetStateAction<PathDataType>) => void,
  startTime: number,
  setStartTime: (value: SetStateAction<number>) => void,
  newPathData: { (): PathDataType; (): any },
  currentShape: ShapeType,
  setCurrentShape: (value: SetStateAction<ShapeType>) => void,
  simplifyTolerance: number,
  d3CurveBasis: string,
) => {
  if (!editMode || !penTipRef.current) {
	console.log('editing not allowed....');
    return;
  }

  myConsole.log(penTipRef.current);

  switch (state) {
    case "began": {
      // Console.log("began")
      setStartTime(Date.now());

      const newPath = newPathData();
      setCurrentPath({
        ...newPath,
        guid: Crypto.randomUUID(),
        path: `M${penTipRef.current.x},${penTipRef.current.y}`,
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
      });

      // Shape takes precedance over path
      if (isValidShape(currentShape.name)) {
        setCurrentShape((previous) => ({
			...previous,
              start: penTipRef.current,
        }));
      }

      break;
    }

    case "active": {
      console.log("active")
      if (isValidShape(currentShape.name)) {
        setCurrentShape((previous) => {
          previous.end = penTipRef.current;
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

        setCurrentPath({
          ...currentPath,
          path: pathExtend,
        });
      }

      break;
    }

    case "ended": {
      console.log("ended");
      // MyConsole.log("time", currentPath.time)

      if (erasureMode) {
        // Use currentPath as erasure
        const newCompletedPaths = applyErasure(
          currentPath,
          myPathData.pathData,
        );
        setMyPathData((previous: MyPathDataType) => ({
          ...previous,
          metaData: { ...previous.metaData, updatedAt: "" },
          pathData: newCompletedPaths,
        }));
        setCurrentPath(newPathData());
        setStartTime(0);
        return;
      }

      currentPath.time = Date.now() - startTime;
      const points = getPointsFromPath(currentPath.path);
      currentPath.path = "";


      const curveBasis: d3.CurveFactoryLineOnly = getD3CurveBasis(
        d3CurveBasis,
        isValidShape(currentShape.name),
      );
      if (curveBasis && points.length >= 7) {
        const pointsXY = points.map((point) => [point.x, point.y]);
        // Create a line generator
        if (curveBasis) {
          const line = d3.line().curve(curveBasis);
          // Generate the path data
          currentPath.path = line(pointsXY as Array<[number, number]>) || "";
          // MyConsole.log(currentPath);
        }
      }

      if (currentPath.path === "") {
        currentPath.path = getPathFromPoints(points);
      }

      if (isValidPath(currentPath.path)) {
        currentPath.visible = true;
        currentPath.selected = false;
        currentPath.length = getPathLength(points);
        setMyPathData((previous: MyPathDataType) => ({
          ...previous,
          metaData: { ...previous.metaData, updatedAt: "" },
          pathData: [...previous.pathData, currentPath],
        }));
      }

      setCurrentPath(newPathData());
      setStartTime(0);
      break;
    }

    default: {
      break;
    }
  }
};



/*


// TODO ONCE THIS WORKS, EITHER MOVE THIS TO HANDLE DRAWING EVENT OR MAKE IT GENERIC FOR ALL EVENTS
      // if smart mode is on, lets find the nearest point to snap to
      // the target point is the one drawn most recently and is within finger tip range
    //   if (enhancedDrawingMode && existingPaths.current.length > 0) {
    //     // If paths seems out of order, this could have caused it
    //     // get paths ordered by updatedAt
    //     // console.log('using snapping point')
    //     penTipRef.current = getSnappingPoint(
    //       existingPaths.current,
    //       { x: event.x, y: event.y },
    //       canvasScale,
    //       canvasTranslate,
    //     );
    //     // console.log('BEGAN penTipRef.current', penTipRef.current);
    //   } else {
    //     penTipRef.current = {
    //       x:
    //         event.x * canvasScale +
    //         penOffsetReference.current.x +
    //         canvasTranslate.x, // * SCREEN_WIDTH,
    //       y:
    //         event.y * canvasScale +
    //         penOffsetReference.current.y +
    //         canvasTranslate.y, // * SCREEN_HEIGHT,
    //     };
        // console.log('BEGAN penTipRef.current', penTipRef.current);
    //   }

	*/