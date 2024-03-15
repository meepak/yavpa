
import * as Crypto from "expo-crypto";
import { getPathFromPoints, getPointsFromPath } from "@u/helper";
import { GestureUpdateEvent, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import { SetStateAction } from "react";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PathDataType, SvgDataType } from "@u/types";
import { Platform } from "react-native";

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

            const boundaryBoxPoints = getPointsFromPath(activeBoundaryBoxPath.path);
            const movedBoundaryBox = boundaryBoxPoints.map((point) => {
                return {
                    x: point.x + xOffset,
                    y: point.y + yOffset,
                };
            });
            const movedBoundaryBoxPath = getPathFromPoints(movedBoundaryBox);
            // move selected paths

            setSvgData((prev) => {
                prev.pathData.forEach((item) => {
                  if (item.selected === true) {
                    const points = getPointsFromPath(item.path);
                    const movedPoints = points.map((point) => {
                      return {
                        x: point.x + xOffset,
                        y: point.y + yOffset,
                      };
                    });

                    item.path = getPathFromPoints(movedPoints);
                    item.updatedAt = new Date().toISOString();
                  }
                });
                prev.metaData.updated_at = "";
                return prev;
              });


            setActiveBoundaryBoxPath({
                ...activeBoundaryBoxPath,
                path: movedBoundaryBoxPath,
            });

            break;
        case "ended":
            console.log("select ended");
            break;
    }
}
