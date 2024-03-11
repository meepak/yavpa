
// import * as Crypto from "expo-crypto";
// import { getPathFromPoints, getPointsFromPath, getViewBoxTrimmed } from "@u/helper";
// import { GestureStateChangeEvent, GestureUpdateEvent, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
// import { SetStateAction } from "react";
// import { CANVAS_HEIGHT, CANVAS_WIDTH, PathDataType, SvgDataType } from "@u/types";

// const startPoint = {
//     x: 0,
//     y: 0,
// };
// export const handleTranslateEvent = (
//     event: GestureStateChangeEvent<PanGestureHandlerEventPayload> | GestureUpdateEvent<PanGestureHandlerEventPayload>,
//     state: string,
//     selectedPaths: PathDataType[],
//     setSelectedPaths: { (value: SetStateAction<PathDataType[]>): void; },
//     activeBoundaryBoxPath: PathDataType | null,
//     setActiveBoundaryBoxPath: { (value: SetStateAction<PathDataType | null>): void; },
// ) => {
//     if (!activeBoundaryBoxPath) { return; }
//     switch (state) {
//         case "began":
//             // console.log('Begin select translate');
//             // should be within the active boundary box, WHY?? let it be draggable from anywhere
//             // its all about relative position anyway
//             // if (!pathContainsPoint(selectBoundaryBoxPath.path, { x: event.x, y: event.y })) {
//             //     console.log("out of boundary box");
//             //     startPoint.x = -1;
//             //     startPoint.y = -1;
//             // }
//             // track starting point
//             startPoint.x = event.translationX;
//             startPoint.y = event.translationY;
//             break;
//         case "active":
//             // if(startPoint.x < 0 && startPoint.y < 0) { return; }

//             const xOffset = event.translationX - startPoint.x;
//             const yOffset = event.translationY - startPoint.y;


//             // update starting point for the next frame
//             startPoint.x = event.translationX;
//             startPoint.y = event.translationY;

//             const boundaryBoxPoints = getPointsFromPath(activeBoundaryBoxPath.path);
//             const movedBoundaryBox = boundaryBoxPoints.map((point) => {
//                 return {
//                     x: point.x + xOffset,
//                     y: point.y + yOffset,
//                 };
//             });


//             const minX = 0;
//             const minY = 0;
//             const maxX = CANVAS_WIDTH;
//             const maxY = CANVAS_HEIGHT;

//             let noFurther = false;
//             // Check if the box is outside the canvas on the left or top
//             if (movedBoundaryBox[0].x < minX) {
//                 movedBoundaryBox[0].x = minX;
//                 noFurther = true;
//             }
//             if (movedBoundaryBox[0].y < minY) {
//                 movedBoundaryBox[0].y = minY;
//                 noFurther = true;
//             }

//             // Check if the box is outside the canvas on the right or bottom
//             if (movedBoundaryBox[2].x > maxX) {
//                 movedBoundaryBox[2].x = maxX;
//                 noFurther = true;
//             }
//             if (movedBoundaryBox[2].y > maxY) {
//                 movedBoundaryBox[2].y = maxY;
//                 noFurther = true;
//             }

//             if(noFurther) return;


//             const movedBoundaryBoxPath = getPathFromPoints(movedBoundaryBox);

//           activeBoundaryBoxPath.path = movedBoundaryBoxPath;
    


//             //WE DO NOT WANT THE NEW PTH TO BE CREATED, WE WANT THE EXISTING PATH TO BE DRAGGED
//             // THAT MEANS WE MUST MUTATE EXISTING OBJECT
// selectedPaths.forEach((path) => {   
//     const points = getPointsFromPath(path.path);
//     const movedPoints = points.map((point) => {
//         return {
//             x: point.x + xOffset,
//             y: point.y + yOffset,
//         };
//     });
// });


//             // lets apply same logic to the selected object as well and translate them
//             // setSelectedPaths((prev) => {
//             //     return prev.map((path) => {
//             //         const points = getPointsFromPath(path.path);
//             //         const movedPoints = points.map((point) => {
//             //             return {
//             //                 x: point.x + xOffset,
//             //                 y: point.y + yOffset,
//             //             };
//             //         });
//             //         const movedPath = getPathFromPoints(movedPoints);
//             //         return {
//             //             ...path,
//             //             path: movedPath,
//             //         };
//             //     });
//             // });



//             break;
//         case "ended":
//             // console.log("select ended");
//             break;
//     }
// }