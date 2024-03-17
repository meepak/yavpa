import { PinchGestureHandlerEventPayload, GestureUpdateEvent } from "react-native-gesture-handler";
import { SetStateAction } from "react";
import { PathDataType, SvgDataType } from "@u/types";
import { getPointsFromPath, getPathFromPoints, scalePoints, getPathLength } from "@u/helper";
import * as Crypto from "expo-crypto";

let startScale = 1;

export const handleScaleEvent = (
    event: GestureUpdateEvent<PinchGestureHandlerEventPayload>,
    state: string,
    editMode: boolean,
    setSvgData: (value: SetStateAction<SvgDataType>) => void,
    activeBoundaryBoxPath: PathDataType | null,
    setActiveBoundaryBoxPath: (value: SetStateAction<PathDataType | null>) => void,
) => {
    if (!activeBoundaryBoxPath || editMode) return;

    switch (state) {
        case "began":
            // track starting scale
            startScale = event.scale;
            break;
        case "active":
            // calculate scale factor
            const scaleFactor = event.scale / startScale;
            const scaleFactorX = scaleFactor;
            const scaleFactorY = scaleFactor;

            const focalPoint = {x: event.focalX, y: event.focalY};
            // scale boundary box
            // const boundaryBoxPoints = getPointsFromPath(activeBoundaryBoxPath.path);
            // const scaledBoundaryBox = scalePoints(boundaryBoxPoints, scaleFactorX, scaleFactorY, focalPoint);
            // const scaledBoundaryBoxPath = getPathFromPoints(scaledBoundaryBox);

            // scale selected paths
            setSvgData((prev) => {
                prev.pathData.forEach((item) => {
                    if (item.selected === true) {
                        const points = getPointsFromPath(item.path);
                        const scaledPoints = scalePoints(points, scaleFactorX, scaleFactorY, focalPoint);
                        item.path = getPathFromPoints(scaledPoints);
                        item.updatedAt = new Date().toISOString();
                    }
                });
                return prev;
            });

            setActiveBoundaryBoxPath({
                ...activeBoundaryBoxPath,
                visible: false,
                updatedAt: new Date().toISOString(),
                // path: scaledBoundaryBoxPath,
            });

            // update starting scale for the next frame
            startScale = event.scale;
            break;
        case "ended": setSvgData((prev) => {
            prev.pathData.forEach((item) => {
                if (item.selected === true) {
                    const points = getPointsFromPath(item.path);
                    // calculate new length, scale time proportion to change in length
                    const newLength = getPathLength(points);
                    // console.log("length, new length, old time", item.length, newLength, item.time);
                    item.time = item.time * newLength / item.length;
                    item.length = newLength;
                    item.updatedAt = new Date().toISOString();
                }
            });
            prev.metaData.updatedAt = "";
            return prev;
        });
            break;
    }
}