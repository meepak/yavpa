import { getPathFromPoints, getPointsFromPath } from "@u/helper";
import { PathDataType, PointType, SvgDataType } from "@u/types";
import { polygonCentroid, polygonLength } from "d3";
import { SetStateAction } from "react";
import { GestureStateChangeEvent, GestureUpdateEvent, PinchGestureHandlerEventPayload } from "react-native-gesture-handler";
import { SharedValue } from "react-native-reanimated";
import { debounce } from "lodash";

export const handleSelectedPathScale = debounce((
    event: GestureStateChangeEvent<PinchGestureHandlerEventPayload> | GestureUpdateEvent<PinchGestureHandlerEventPayload>,
    state: string,
    scale: SharedValue<number>,
    savedScale: SharedValue<number>,
    setSvgData: { (value: SetStateAction<SvgDataType>): void; },
    activeBoundaryBoxPath: PathDataType | null,
    setActiveBoundaryBoxPath: { (value: SetStateAction<PathDataType | null>): void; },
) => {
    if (!activeBoundaryBoxPath) { return; }
    // for scaling
    // first translate to focalPoint
    // scale around focalPoint
    // translate back to original position
    // for given points, focalpoint and scale, lets create a generic function to scale
    const applyScaling = (points: PointType[], focalPoint: PointType, scale: number) => {
        return points.map((point) => {
            const x = (point.x - focalPoint.x) * scale + focalPoint.x;
            const y = (point.y - focalPoint.y) * scale + focalPoint.y;
            return { x, y };
        });
    }

    switch (state) {
        case "began":
            // console.log('selected path scale began');
            break;
        case "active":
            // console.log('selected path scale active');
            scale.value = savedScale.value * event.scale;

            //limit scale to 0.1 to 10
            if (scale.value < 0.1) {
                scale.value = 0.1;
            } else if (scale.value > 10) {
                scale.value = 10;
            }

            // const focalPoint = { x: event.focalX, y: event.focalY };

            const boundaryBoxPoints = getPointsFromPath(activeBoundaryBoxPath.path);

            // focal point should be center of the boundary box
            const polygonCentroids = polygonCentroid(boundaryBoxPoints.map(point => [point.x, point.y]));   
            const focalPoint = { x: polygonCentroids[0], y: polygonCentroids[1] };

            const scaledBoundaryBox = applyScaling(boundaryBoxPoints, focalPoint, scale.value);

            // apply scale to the selected path
            // setSvgData((prev) => {
            //     const newPathData = prev.pathData.map((path) => {
            //         if(path.selected) {
            //             const points = getPointsFromPath(path.path);
            //             const scaledPoints = applyScaling(points, focalPoint, scale.value);
            //             const newPath = getPathFromPoints(scaledPoints);
            //             // calculate path length
            //             const length = polygonLength(scaledPoints.map(point => [point.x, point.y]));
            //             // adjust time proportionally based on scale
            //             const time = path.time * (1 / scale.value);
            //             return { ...path, path: newPath, length, time };
            //         }
            //         return path;
            //     });
            //     return { ...prev, pathData: newPathData };
            // });

            // update boundary box path
            const scaledBoundaryBoxPath = getPathFromPoints(scaledBoundaryBox);
            // console.log('scaledBoundaryBoxPath', scaledBoundaryBoxPath);
            setActiveBoundaryBoxPath({
                ...activeBoundaryBoxPath,
                path: scaledBoundaryBoxPath,
            });


            break;
        case "ended":
            savedScale.value = scale.value;
            // console.log('selected path scale end');
            break;
    }
},100);
