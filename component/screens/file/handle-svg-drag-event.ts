
import { getPathFromPoints, getPointsFromPath } from "@u/helper";
import { GestureUpdateEvent, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import { SetStateAction } from "react";
import { SvgDataType } from "@u/types";

const startPoint = {
    x: 0,
    y: 0,
};
export const handleSvgDragEvent = (
    event: GestureUpdateEvent<PanGestureHandlerEventPayload>,
    state: string,
    setSvgData: { (value: SetStateAction<SvgDataType>): void; },
) => {
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


            // move all paths including invisible ones
            setSvgData((prev) => {
                // Create a new copy of pathData with the changes applied
                const newPathData = prev.pathData.map((item) => {
                    const points = getPointsFromPath(item.path);
                    const movedPoints = points.map((point) => {
                        return {
                            x: point.x + xOffset,
                            y: point.y + yOffset,
                        };
                    });

                    // Return a new copy of the item with the updated path
                    return { ...item, path: getPathFromPoints(movedPoints) };
                });

                // Return a new copy of prev with the updated pathData and metaData
                return {
                    prev,
                    pathData: newPathData,
                    metaData: { ...prev.metaData },
                };
            });

            break;

        case "ended":
            console.log("select ended");
            setSvgData((prev) => {
                // Return a new copy of prev with the updated pathData and metaData
                return {
                    pathData: {...prev.pathData},
                    metaData: { ...prev.metaData, updated_at: "" },
                };
            });
            break;
    }
}
