import { RotationGestureHandlerEventPayload, GestureUpdateEvent } from "react-native-gesture-handler";
import { SetStateAction } from "react";
import { PathDataType, SvgDataType } from "@u/types";
import { getPointsFromPath, getPathFromPoints, rotatePoints } from "@u/helper";
import * as Crypto from "expo-crypto";

let startAngle = 0;

export const handleRotateEvent = (
    event: GestureUpdateEvent<RotationGestureHandlerEventPayload>,
    state: string,
    editMode: boolean,
    setSvgData: (value: SetStateAction<SvgDataType>) => void,
    activeBoundaryBoxPath: PathDataType | null,
    setActiveBoundaryBoxPath: (value: SetStateAction<PathDataType | null>) => void,
) => {
    if (!activeBoundaryBoxPath || editMode) return;

    switch (state) {
        case "began":
            // track starting angle
            startAngle = event.rotation;
            break;
        case "active":
            // calculate rotation angle
            const rotationAngle = event.rotation - startAngle;

            const pivot = {x: event.anchorX, y: event.anchorY};

            // rotate boundary box
            // const boundaryBoxPoints = getPointsFromPath(activeBoundaryBoxPath.path);
            // calculate center of the boundary box
            // const pivot = boundaryBoxPoints.reduce((acc, point) => {
            //     return {
            //         x: acc.x + point.x,
            //         y: acc.y + point.y,
            //     };
            // }, { x: 0, y: 0 });
            // const rotatedBoundaryBox = rotatePoints(boundaryBoxPoints, rotationAngle, pivot);
            // const rotatedBoundaryBoxPath = getPathFromPoints(rotatedBoundaryBox);

            // rotate selected paths
            setSvgData((prev) => {
                let points: { [key: string]: PointType[] } = {};

                prev.pathData.forEach((item) => {
                    if (item.selected === true) {
                        points[item.guid] = getPointsFromPath(item.path);
                    }
                });

                Object.keys(points).forEach((key) => {
                    points[key] = rotatePoints(points[key], rotationAngle, pivot);
                });

                prev.pathData.forEach((item) => {
                    if (points[item.guid]) {
                        item.path = getPathFromPoints(points[item.guid]);
                        item.updatedAt = new Date().toISOString();
                    }
                });

                prev.updatedAt = new Date().toISOString();
                return prev;
            });

            // It seems change in svgData is not causing re-rendering
            // may be its bit more complex object, but change in boundary box causes re-rendering
            // so we are updating boundary box updated field only without updating actual path data
            setActiveBoundaryBoxPath({
                ...activeBoundaryBoxPath,
                visible: false,
                updatedAt: new Date().toISOString(),
            });

            // update starting angle for the next frame
            startAngle = event.rotation;
            break;
        case "ended":
            startAngle = 0;
            setSvgData((prev) => {
                prev.metaData.updatedAt = "";
                return prev;
            });
            break;
    }
}