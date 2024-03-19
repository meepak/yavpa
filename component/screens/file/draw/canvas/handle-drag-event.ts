
import { getPathFromPoints, getPointsFromPath } from "@u/helper";
import { GestureUpdateEvent, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import { SetStateAction, useCallback } from "react";
import { PathDataType, PointType, SvgDataType } from "@u/types";

const startPoint = {
  x: 0,
  y: 0,
};
export const handleDragEvent = (
  event: GestureUpdateEvent<PanGestureHandlerEventPayload>,
  state: string,
  editMode: boolean,
  setSvgData: { (value: SetStateAction<SvgDataType>): void; },
  activeBoundaryBoxPath: PathDataType | null,
  setActiveBoundaryBoxPath: { (value: SetStateAction<PathDataType | null>): void; },
) => {


  if (!activeBoundaryBoxPath || editMode) return;
  switch (state) {
    case "began":
      // console.log("start pan began in", Platform.OS);
      // track starting point
      startPoint.x = event.translationX;
      startPoint.y = event.translationY;
      break;
    case "active":
      // console.log("select pan active in", Platform.OS);
      // track how x offset and y offset
      // apply to selected paths and boudary box
      const xOffset = event.translationX - startPoint.x;
      const yOffset = event.translationY - startPoint.y;



      // update starting point for the next frame
      startPoint.x = event.translationX;
      startPoint.y = event.translationY;

      // const boundaryBoxPoints = getPointsFromPath(activeBoundaryBoxPath.path);
      // const movedBoundaryBox = boundaryBoxPoints.map((point) => {
      //   return {
      //     x: point.x + xOffset,
      //     y: point.y + yOffset,
      //   };
      // });
      // const movedBoundaryBoxPath = getPathFromPoints(movedBoundaryBox);
      // move selected paths

      setSvgData((prev) => {
        let points: { [key: string]: PointType[] } = {};

        prev.pathData.forEach((item) => {
          if (item.selected === true) {
            points[item.guid] = getPointsFromPath(item.path);
          }
        });

        Object.keys(points).forEach((key) => {
          points[key] = points[key].map((p) => {
            return {
              x: p.x + xOffset,
              y: p.y + yOffset,
            };
          });
        });

        prev.pathData.forEach((item) => {
          if (points[item.guid]) {
            item.path = getPathFromPoints(points[item.guid]);
            item.updatedAt = new Date().toISOString();
          }
        });

        return prev;
      });

      // for sake of rerendering
      setActiveBoundaryBoxPath({
        ...activeBoundaryBoxPath,
        visible: false,
        updatedAt: new Date().toISOString(),
      });

      break;

    case "ended":
      // Reset startPoint
      startPoint.x = 0;
      startPoint.y = 0;
      console.log("select ended");
      setSvgData((prev) => {
        prev.metaData.updatedAt = "";
        return prev;
      });


      break;
  }
};
