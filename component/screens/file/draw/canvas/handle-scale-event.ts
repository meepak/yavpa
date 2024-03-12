import { PinchGestureHandlerEventPayload, GestureUpdateEvent } from "react-native-gesture-handler";
import { SetStateAction } from "react";
import { PathDataType, SvgDataType } from "@u/types";
import { getPointsFromPath, getPathFromPoints, scalePoints } from "@u/helper";
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

            // scale boundary box
            const boundaryBoxPoints = getPointsFromPath(activeBoundaryBoxPath.path);
            const scaledBoundaryBox = scalePoints(boundaryBoxPoints, scaleFactor);
            const scaledBoundaryBoxPath = getPathFromPoints(scaledBoundaryBox);

            // scale selected paths
            setSvgData((prev) => {
                prev.pathData.forEach((item) => {
                    if (item.selected === true) {
                        const points = getPointsFromPath(item.path);
                        const scaledPoints = scalePoints(points, scaleFactor);
                        item.path = getPathFromPoints(scaledPoints);
                        item.guid = Crypto.randomUUID();
                    }
                });
                prev.metaData.updated_at = "";
                return prev;
            });

            setActiveBoundaryBoxPath({
                ...activeBoundaryBoxPath,
                path: scaledBoundaryBoxPath,
            });

            // update starting scale for the next frame
            startScale = event.scale;
            break;
        case "ended":
            break;
    }
}