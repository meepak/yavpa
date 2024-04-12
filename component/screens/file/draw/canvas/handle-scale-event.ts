import { PinchGestureHandlerEventPayload, GestureUpdateEvent } from "react-native-gesture-handler";
import { SetStateAction } from "react";
import { PathDataType, PointType, MyPathDataType } from "@u/types";
import { getPointsFromPath, getPathFromPoints, scalePoints, getPathLength } from "@u/helper";
import * as Crypto from "expo-crypto";
import myConsole from "@c/my-console-log";

let startScale = 1;

export const handleScaleEvent = (
    event: GestureUpdateEvent<PinchGestureHandlerEventPayload>,
    state: string,
    editMode: boolean,
    setMyPathData: (value: SetStateAction<MyPathDataType>) => void,
    activeBoundaryBoxPath: PathDataType | null,
    setActiveBoundaryBoxPath: (value: SetStateAction<PathDataType | null>) => void,
    scaleMode: 'X' | 'Y' | 'XY',
    setScaleMode: (value: SetStateAction<'X' | 'Y' | 'XY'>) => void
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
            const scaleFactorX = scaleMode === 'X' || scaleMode === 'XY' ? scaleFactor : 1;
            const scaleFactorY = scaleMode === 'Y' || scaleMode === 'XY' ? scaleFactor : 1;

            const focalPoint = {x: event.focalX, y: event.focalY};
            // scale boundary box
            // const boundaryBoxPoints = getPointsFromPath(activeBoundaryBoxPath.path);
            // const scaledBoundaryBox = scalePoints(boundaryBoxPoints, scaleFactorX, scaleFactorY, focalPoint);
            // const scaledBoundaryBoxPath = getPathFromPoints(scaledBoundaryBox);

            // scale selected paths
            setMyPathData((prev) => {
                prev.pathData.forEach((item) => {
                    if (item.selected === true) {
                        const points = getPointsFromPath(item.path);
                        const scaledPoints = scalePoints(points, scaleFactorX, scaleFactorY, focalPoint);
                        item.path = getPathFromPoints(scaledPoints);

                        //we need original value to prevent this from going to 1 and equalizing with everyhting else
                        item.strokeWidth *= scaleFactor;

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
        case "ended":
            myConsole.log("scale ended");
            setMyPathData((prev) => {
                let points: { [key: string]: PointType[] } = {};

                prev.pathData.forEach((item) => {
                    if (item.selected === true) {
                        points[item.guid] = getPointsFromPath(item.path);
                    }
                });

                Object.keys(points).forEach((key) => {
                    const newLength = getPathLength(points[key]);
                    const item = prev.pathData.find((item) => item.guid === key);
                    if (item) {
                        item.time = item.time * newLength / item.length;
                        item.length = newLength;
                        item.updatedAt = new Date().toISOString();
                    }
                });

                prev.metaData.updatedAt = "";
                return prev;
            });
            startScale = 1;
            setScaleMode("XY");
            break;
    }
}