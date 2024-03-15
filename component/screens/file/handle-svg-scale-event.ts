import { PinchGestureHandlerEventPayload, GestureUpdateEvent } from "react-native-gesture-handler";
import { SetStateAction } from "react";
import { PathDataType, SvgDataType } from "@u/types";
import { getPointsFromPath, getPathFromPoints, scalePoints } from "@u/helper";

let startScale = 1;

export const handleSvgScaleEvent = (
    event: GestureUpdateEvent<PinchGestureHandlerEventPayload>,
    state: string,
    setSvgData: (value: SetStateAction<SvgDataType>) => void,
    activeBoundaryBoxPath: PathDataType | null,
) => {
    if (activeBoundaryBoxPath) return;

    switch (state) {
        case "began":
            // track starting scale
            startScale = event.scale;
            break;
        case "active":
            // calculate scale factor
            const scaleFactor = event.scale / startScale;

            const focalPoint = { x: event.focalX, y: event.focalY };
            // scale boundary box

            // scale selected paths
            setSvgData((prev) => {
                prev.pathData.forEach((item) => {
                    // if (item.selected === true) {
                        const points = getPointsFromPath(item.path);
                        const scaledPoints = scalePoints(points, scaleFactor, focalPoint);
                        item.path = getPathFromPoints(scaledPoints);
                        item.updatedAt = new Date().toISOString();
                    // }
                });
                return prev;
            });


            // update starting scale for the next frame
            startScale = event.scale;
            break;
        case "ended": setSvgData((prev) => {
            prev.metaData.updated_at = "";
            return prev;
        });
            break;
    }
}