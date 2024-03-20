// import { applyErasure } from "@u/erasure";
import myConsole from "@c/my-console-log";
import { applyErasure } from "./apply-erasure";
import { getPathFromPoints, getPathLength, getPointsFromPath, isValidPath, precise } from "@u/helper";
import { getD3CurveBasis, isValidShape, shapeData } from "@u/shapes";
import { MY_BLACK, PathDataType, PointType, ShapeType, SvgDataType } from "@u/types";
import * as d3 from "d3-shape";
import * as Crypto from "expo-crypto";
import { SetStateAction } from "react";
import { GestureStateChangeEvent, GestureUpdateEvent, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import simplify from "simplify-js";

/*
ERASURE MODE IS NOT USED IN THIS VERSION, WILL REFINE IT LATER
*/
export const handleDrawingEvent = (
  event: GestureStateChangeEvent<PanGestureHandlerEventPayload> | GestureUpdateEvent<PanGestureHandlerEventPayload>,
  state: string,
  svgData: SvgDataType,
  setSvgData: { (value: SetStateAction<SvgDataType>): void; },
  editMode: boolean,
  erasureMode: boolean,
  currentPath: PathDataType,
  setCurrentPath: { (value: SetStateAction<PathDataType>): void; },
  startTime: number,
  setStartTime: { (value: SetStateAction<number>): void; },
  newPathData: { (): PathDataType; (): any; },
  currentShape: ShapeType,
  setCurrentShape: { (value: SetStateAction<ShapeType>): void; },
  // completedPaths: PathDataType[],
  // setCompletedPaths: { (value: SetStateAction<PathDataType[]>): void; },
  simplifyTolerance: number,
  d3CurveBasis: string,
  penOffset?: PointType,
) => {

  // const erasureMode = false; //disabling for safety in this version


  if (!editMode) return;



  const pt = {
    x: precise(event.x + (penOffset?.x ?? 0)),
    y: precise(event.y+ (penOffset?.y ?? 0)),
  };



  switch (state) {
    case "began":
      setStartTime(Date.now());

      const newPath = newPathData();
      setCurrentPath({
        ...newPath,
        guid: Crypto.randomUUID(),
        path: `M${pt.x},${pt.y}`,
        ...(erasureMode
          ? {
            stroke: MY_BLACK,
            strokeWidth: 2,
            strokeOpacity: 0.5,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            fill: "#FF0000",
            strokeDasharray: "5,5",
            strokeDashoffset: 0
          }
          : {})
      });

      // shape takes precedance over path
      if (isValidShape(currentShape.name)) {
        setCurrentShape((prev) => {
          prev.start = pt as PointType;
          return prev;
        });
      }
      break;
    case "active":
      if (isValidShape(currentShape.name)) {
        setCurrentShape((prev) => {
          prev.end = pt as PointType;
          return prev;
        });
        const path = shapeData(currentShape);

        setCurrentPath({
          ...currentPath,
          path: path,
        });
        break;
      }

      if (currentPath.path !== "") {
        let pathExtend = currentPath.path;

        // erasure paths are always closed
        if (erasureMode) {
          // remove last Z from path
          pathExtend = pathExtend.endsWith('Z') ? pathExtend.slice(0, -1) : pathExtend;
        }
        pathExtend = `${pathExtend}L${pt.x},${pt.y}`;
        if (erasureMode) {
          // close the path
          pathExtend += `Z`;
        }

        setCurrentPath({
          ...currentPath,
          path: pathExtend,
        });
      }
      break;
    case "ended":
      currentPath.time = Date.now() - startTime;
      // myConsole.log("time", currentPath.time)

      if (erasureMode) {
        // use currentPath as erasure
        const newCompletedPaths = applyErasure(currentPath, svgData.pathData);
        setSvgData((prev: SvgDataType) => ({ metaData: { ...prev.metaData, updatedAt: "" }, pathData: newCompletedPaths }));
        setCurrentPath(newPathData());
        setStartTime(0);
        return;
      }

      let points = getPointsFromPath(currentPath.path);
      currentPath.path = "";

      if (simplifyTolerance > 0) {
        if (points.length >= 2) {
          points = simplify(points, simplifyTolerance);
        }
      }

      let curveBasis: d3.CurveFactoryLineOnly | undefined;
      if (d3CurveBasis) {
        curveBasis = getD3CurveBasis(d3CurveBasis);
      }
      if (curveBasis && points.length >= 2) {
        const pointsXY = points.map((point) => [
          point.x,
          point.y,
        ]);
        // Create a line generator
        if (curveBasis) {
          const line = d3.line().curve(curveBasis);
          // Generate the path data
          currentPath.path = line(pointsXY as [number, number][]) || "";
          // myConsole.log(currentPath);
        }
      }

      if (currentPath.path === "") {
        currentPath.path = getPathFromPoints(points);
      }

      if (isValidPath(currentPath.path)) {
        currentPath.visible = true;
        currentPath.selected = false;
        currentPath.length = getPathLength(points);
        myConsole.log('setting completed path from drawing event');
        // setCompletedPaths((prev) => [...prev, currentPath]);
        setSvgData((prev: SvgDataType) => ({
          metaData: { ...prev.metaData, updatedAt: "" },
          pathData: [...prev.pathData, currentPath]
        }));
      }

      setCurrentPath(newPathData());
      setStartTime(0);
      break;
    default:
      break;
  }
};