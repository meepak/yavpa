import { PinchGestureHandlerEventPayload, GestureUpdateEvent } from "react-native-gesture-handler";
import { SetStateAction } from "react";
import { SvgDataType } from "@u/types";
import { getPointsFromPath, getPathFromPoints, scalePoints } from "@u/helper";

let startScale = 1;

export const handleSvgScaleEvent = (
    event: GestureUpdateEvent<PinchGestureHandlerEventPayload>,
    state: string,
    editMode: boolean,
    setSvgData: (value: SetStateAction<SvgDataType>) => void,
) => {
    switch (state) {
        case "began":
            // track starting scale
            startScale = event.scale;
            break;
        case "active":
            // calculate scale factor
            const scaleFactor = event.scale / startScale;


            // scale selected paths
            setSvgData((prev) => {
                prev.pathData.forEach((item) => {
                        const points = getPointsFromPath(item.path);
                        const scaledPoints = scalePoints(points, scaleFactor);
                        item.path = getPathFromPoints(scaledPoints);
                        // item.guid = Crypto.randomUUID();
                });
                prev.metaData.updated_at = "";
                return prev;
            });

            // update starting scale for the next frame
            startScale = event.scale;
            break;
        case "ended":
            break;
    }
}