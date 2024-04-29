import {
  calculateDistance,
  get5PointsFromPath,
  getPathFromPoints,
  getPathLength,
  getPointsFromPath,
  getSnappingPoint,
  isValidPath,
} from "@u/helper";
import { getD3CurveBasis, isValidShape, shapeData } from "@u/shapes";
import {
  MY_BLACK,
  type PathDataType,
  type PointType,
  type ShapeType,
  type MyPathDataType,
  SNAPPING_TOLERANCE,
} from "@u/types";
import * as d3 from "d3-shape";
import * as Crypto from "expo-crypto";
import createShapeit from "@l/shapeit/src";
import { type SetStateAction } from "react";
import {
  type GestureStateChangeEvent,
  type GestureUpdateEvent,
  type PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { applyErasure } from "./erase";

export const handleDrawingEvent = (
  penTipRef: React.MutableRefObject<PointType | undefined>,
  event:
    | GestureStateChangeEvent<PanGestureHandlerEventPayload>
    | GestureUpdateEvent<PanGestureHandlerEventPayload>,
  state: string,
  myPathData: MyPathDataType,
  setMyPathData: (value: SetStateAction<MyPathDataType>) => void,
  canvasScale: number,
  canvasTranslate: PointType,
  editMode: boolean,
  erasureMode: boolean,
  enhancedDrawingMode: boolean,
  snappingMode: boolean,
  existingPaths: React.MutableRefObject<PathDataType[]>,
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
    // console.log('editing not allowed....');
    return;
  }

  const getCurrentPath = (pathPoints: PointType[]) => {
    // currentPath.path = getPathFromPoints(pathPoints);
    if (isValidPath(currentPath.path)) {
      currentPath.visible = true;
      currentPath.selected = false;
      currentPath.length = getPathLength(pathPoints);
    }
    setCurrentPath(currentPath);
    return currentPath;
  };
  //Save current path to state and reset current path
  const saveCurrentPath = (pathPoints: PointType[]) => {
    // currentPath.path = getPathFromPoints(pathPoints); //pathPoint came from path
    if (isValidPath(currentPath.path)) {
      currentPath.visible = true;
      currentPath.selected = false;
      currentPath.length = getPathLength(pathPoints);
      setMyPathData((previous: MyPathDataType) => ({
        ...previous,
        metaData: { ...previous.metaData, updatedAt: "" },
        pathData: [
          ...previous.pathData,
          { ...currentPath, guid: Crypto.randomUUID() },
        ],
      }));
    }
    setCurrentPath(currentPath);
    return currentPath;
  };

  const resetCurrentPath = () => {
    setCurrentPath({
      ...newPathData(),
    });
    setStartTime(0);
  };

  const snapAnalysis = (pathPoints: PointType[], save=true) => {
    if (existingPaths.current.length > 0) {
      // revise first point
      const firstPoint = { ...pathPoints[0] }; // getFirstPoint(revisedCurrentPath.path);
      const revisedFirstPoint = getSnappingPoint(
        existingPaths.current,
        firstPoint,
        canvasScale,
        canvasTranslate,
      );

      console.log('snap analysis');
      let snapped = false;
      if (revisedFirstPoint !== false) {
        pathPoints[0] = revisedFirstPoint;
        // revisedCurrentPath.path = replaceFirstPoint(
        //   revisedCurrentPath.path,
        //   revisedFirstPoint,
        // );
        snapped = true;
        console.log("first point snapped");
      }

      const lastPoint = { ...pathPoints[pathPoints.length - 1] }; // { x: event.x, y: event.y };
      const revisedLastPoint = getSnappingPoint(
        existingPaths.current,
        lastPoint,
        canvasScale,
        canvasTranslate,
      );
      //replace last point in current path
      // since handle drawing point is not extending this point, lets do it here for now
      // this must be cleaned up later once it works as poc
      if (revisedLastPoint !== false) {
        pathPoints[pathPoints.length - 1] = revisedLastPoint;
        // revisedCurrentPath.path = replaceLastPoint(
        //   revisedCurrentPath.path,
        //   revisedLastPoint,
        // );
        snapped = true;
        console.log('last point snapped');
      }

      if (snapped) {
        return save ? saveCurrentPath(pathPoints): getCurrentPath(pathPoints);
      }
      return null;
    }
  };

  // Detect shape in handwritten drawing using createShapeit
  const validShapeDetected = (pathPoints: PointType[]) => {
    // check if shape matches
    const d3Points = pathPoints.map((point) => [point.x, point.y]);
    // shape prediction
    const shape = createShapeit(d3Points);

    console.log("Shape name is " + shape.name);

    let validShapeDetected = false;

    // if (
    //   shape.name in
    //   [
    //     "circle",
    //     "square",
    //     "quadrilateral",
    //     "rectangle",
    //     "triangle",
    //     "pentagon",
    //     "hexagon",
    //     "octagon",
    //   ]
    // ) {
    // const points = shape.map(point => ({x: point[0], y: point[1]}));
    // path = getPathFromPoints(points);
    switch (shape.name) {
      case "circle":
        //     // G  {"center": [222.486367154066, 299.6396762931909], "name": "circle", "radius": 22.522530924163494}
        const center = shape.center;
        const radius = shape.radius;
        //     // Calculate two opposite point on circle
        const startPoint = {
          x: center[0] - radius / 2,
          y: center[1],
        };
        const endPoint = {
          x: center[0] + radius / 2,
          y: center[1],
        };
        currentPath.path = shapeData({
          name: shape.name,
          start: startPoint,
          end: endPoint,
        });
        validShapeDetected = true;
        break;
      default:
        console.log("shape name is ", shape.name);
        const points = shape.map((point) => ({ x: point[0], y: point[1] }));

        // Snapping of points enabled
        if (snappingMode) {
          //------------------------lets try to snap the path to existing paths
          const revisedCurrentPath = snapAnalysis(points, false);
        }

        if (points.length > 0) {
          currentPath.path = getPathFromPoints(points);
          validShapeDetected = true;
        }
        break;
    }

    // Console.log(shapePoints);
    if (validShapeDetected) {
      return saveCurrentPath(pathPoints);
    }
    return false;
  };

  // TODO use pathPoints..
  const parallelPathDetected = (pathPoints: PointType[]) => {
    let lineReplaced = false;

    const current5Points = get5PointsFromPath(currentPath.path);
    //   console.log(current5Points, 'current5Points')
    const currentPath5PointsLength = getPathLength(current5Points);

    // This is not necessary if this runs under enhanced mode as it is covered by shape detection
    // // lets see if the path is fairly striaght
    // if (isLineMeantToBeStraight(current5Points)) {
    //   // The line is meant to be straight
    //   //     console.log('found straight line, replacing it..')
    //   currentPath.path = getPathFromPoints([
    //     current5Points[0],
    //     current5Points[4],
    //   ]);

    //   console.log("Revised and replaced with straight line.");
    //   setCurrentPath({
    //     ...currentPath,
    //     // path: revisedCurrentPath,
    //     updatedAt: new Date().toISOString(),
    //   });

    //   lineReplaced = true;
    //   // return;
    // } else {
    //   console.log("Straight line identification failed");
    // }

    // Now re-asses the whole path, is there a line parallel to this  path within tolerance based on its starting and end point
    // parallel could be  straight line or curved line
    // if yes, then replace the path with this parallel path

    const snappingTolerance = SNAPPING_TOLERANCE * canvasScale;
    existingPaths.current.forEach((path) => {
      // with each path, check if there length is within tolerance matches,
      // if so --lets check 4 points with current path
      // start point, end point and 2 points in between
      // if the distances are within tolerance, then we have a parallel path
      // we will just replicate the same path  this starting and end point

      const path5Points = get5PointsFromPath(path.path);
      const path5PointsLength = getPathLength(path5Points);

      if (
        Math.abs(currentPath5PointsLength - path5PointsLength) >
        snappingTolerance
      ) {
        return;
      }
      // lets check the distance between 5 points
      // first distance
      let distance = calculateDistance(current5Points[0], path5Points[0]);
      if (distance > snappingTolerance) {
        return;
      }
      // second distance
      distance = calculateDistance(current5Points[1], path5Points[1]);
      if (distance > snappingTolerance) {
        return;
      }
      // third distance
      distance = calculateDistance(current5Points[2], path5Points[2]);
      if (distance > snappingTolerance) {
        return;
      }
      // fourth distance
      distance = calculateDistance(current5Points[3], path5Points[3]);
      if (distance > snappingTolerance) {
        return;
      }
      // fifth distance
      distance = calculateDistance(current5Points[4], path5Points[4]);
      if (distance > snappingTolerance) {
        return;
      }
      // we found the match
      // lets translate this path to current paths position
      // replace first and last point, and adjust the inbetween points accordingly
      // now we must use getPointsFromPath to get the points from path
      const pathPoints = getPointsFromPath(path.path);
      const firstPoint = pathPoints[0];
      const lastPoint = pathPoints[pathPoints.length - 1];
      const dx = current5Points[0].x - firstPoint.x;
      const dy = current5Points[0].y - firstPoint.y;
      const newPoints = pathPoints.map((point) => {
        return {
          x: point.x + dx,
          y: point.y + dy,
        };
      });
      // does last point match? if not readjust from last point
      const lastPointDistance = calculateDistance(lastPoint, current5Points[4]);
      if (lastPointDistance > snappingTolerance) {
        const dx = current5Points[4].x - lastPoint.x;
        const dy = current5Points[4].y - lastPoint.y;
        newPoints.forEach((point) => {
          point.x += dx;
          point.y += dy;
        });
      }
      // make sure first and last point exactly matches so replace them with our ones
      newPoints[0] = current5Points[0];
      newPoints[newPoints.length - 1] = current5Points[4];

      console.log("we are replacing the line with parallel one..");
      // now convert this path to string
      const newPath = getPathFromPoints(newPoints);
      currentPath.path = newPath;
      setCurrentPath({
        ...currentPath,
        // path: newPath,
      });
      lineReplaced = true;
      // return;
      // This should make parallel straight line or curved line, finger crossed
    });

    if (lineReplaced) {
      saveCurrentPath(getPointsFromPath(currentPath.path));
      return true;
    }
    return false;
  };
  // myConsole.log(penTipRef.current);

  switch (state) {
    case "began": {
      setStartTime(Date.now());

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
      if (isValidShape(currentShape.name) && penTipRef.current !== undefined) {
        setCurrentShape((previous) => ({
          ...previous,
          start: penTipRef.current as any,
        }));
      }


      // IF YOU WANT DOT, WIGGLE YOUR FINGER LITTLE BIT..
      // ELSE YOU ARE NOT GETTING ONE!!!
      // // If we want a dot, it gets interpreted as tap and we never go beyond begin state
      // // probably could manipulate gesture to allow this but it will create more problem elsewhere
      // // so lets do a work around.
      // // if this was a dot, active state will not enter immediately,
      // // lets create a dot if penTipRef is not changed
      // // and lets check every 10 ms or less.. i guess
      // // Start a timer when the state is "began"
      // if (trackStatus[0] === "began") {
      //   const timerHandle = setTimeout(() => {
      //     // If the state is still "began" after 200ms, create a dot
      //     if (trackStatus[0] === "began" && penTipRef.current !== undefined) {
      //       console.log("creating a dot");
      //       saveCurrentPath([
      //         { x: penTipRef.current.x, y: penTipRef.current.y } as PointType,
      //         {
      //           x: penTipRef.current.x - 1,
      //           y: penTipRef.current.y - 1,
      //         } as PointType,
      //       ]);
      //       resetCurrentPath();
      //     }
      //     // Clear the status
      //     trackStatus.length = 0;
      //   }, 200);
      // } else {
      //   // If the state is not "began", clear the status
      //   trackStatus.length = 0;
      // }

      break;
    }

    case "active": {
      // no need to accumulate status though
      // console.log("active.....");

      if (penTipRef.current === undefined) {
        break;
      }
      if (isValidShape(currentShape.name)) {
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

        //if art pen mode is on, lets create new path on  velocity changes
        // slower velocity, thicker stroke

        // console.log(pathExtend);
        setCurrentPath({
          ...currentPath,
          path: pathExtend,
        });
      }

      break;
    }

    case "ended": {
      // console.log("ended");
      // MyConsole.log("time", currentPath.time)

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
        resetCurrentPath();
        return;
      }

      currentPath.time = Date.now() - startTime;
      const pathPoints = getPointsFromPath(currentPath.path);
      if (pathPoints.length < 3) {
        // assume we wanted a dot
        pathPoints.push(pathPoints[0]);
      }

      // If it was shape, lets deal with it and get over it
      if (isValidShape(currentShape.name)) {
        // we already have currentShape, nothing needs to be done..
        saveCurrentPath(pathPoints);
        resetCurrentPath();
        return;
      }

      // Snapping of points enabled
      if (snappingMode) {
        //------------------------lets try to snap the path to existing paths
        const revisedCurrentPath = snapAnalysis(pathPoints);
        if (revisedCurrentPath) {
          currentPath = revisedCurrentPath; // directly mutate as below can keep going even if state update is late, if causes issue use useRef
          setCurrentPath(revisedCurrentPath);
        }
      }

      // Enhanced drawing mode
      if (enhancedDrawingMode) {
        console.log("enhanced drawing mode");

        if (validShapeDetected(pathPoints)) {
          resetCurrentPath();
          return;
        }
        console.log("valid shape not detected");

        if (parallelPathDetected(pathPoints)) {
          resetCurrentPath();
          return;
        }
      }

      // else lets continue with usual way,
      // this is writing mode, make it very sensitive to be able to draw a point

      // currentPath.path = "";
      const curveBasis: d3.CurveFactoryLineOnly = getD3CurveBasis(
        d3CurveBasis,
        false, // isValidShape(currentShape.name),
      );
      if (curveBasis && pathPoints.length >= 15) {
        const pointsXY = pathPoints.map((point) => [point.x, point.y]);
        // Create a line generator
        if (curveBasis) {
          const line = d3.line().curve(curveBasis);
          // Generate the path data
          currentPath.path = line(pointsXY as Array<[number, number]>) || "";
          // console.log(currentPath);
        }
      }

      // if (currentPath.path === "") {
      //   currentPath.path = getPathFromPoints(pathPoints);
      // }

      if (isValidPath(currentPath.path)) {
        saveCurrentPath(pathPoints);
        // currentPath.visible = true;
        // currentPath.selected = false;
        // currentPath.length = getPathLength(pathPoints);
        // setMyPathData((previous: MyPathDataType) => ({
        //   ...previous,
        //   metaData: { ...previous.metaData, updatedAt: "" },
        //   pathData: [...previous.pathData, currentPath],
        // }));
      }
      resetCurrentPath();

      // setCurrentPath(newPathData());
      // setStartTime(0);
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
