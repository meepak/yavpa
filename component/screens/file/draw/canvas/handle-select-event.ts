import { PathDataType, MyPathDataType } from "@u/types";
import { SetStateAction } from "react";
import { GestureStateChangeEvent, GestureUpdateEvent, TapGestureHandlerEventPayload } from "react-native-gesture-handler";
import { getPointsFromPath, getViewBoxTrimmed } from "@u/helper";
import { polygonContains } from 'd3-polygon';
import { getBoundaryBox } from "@c/my-boundary-box-paths";

export const handleSelectEvent = (
  event: GestureStateChangeEvent<TapGestureHandlerEventPayload>,
  activeBoundaryBoxPath: PathDataType | null,
  setMyPathData: { (value: SetStateAction<MyPathDataType>): void; },
) => {
  const tapPoint = {
    x: event.x,
    y: event.y,
  }
    const tappedInsidePathData = (pathData: PathDataType, isPathBbox = false) => {

      const pathBoundaryBox = isPathBbox
                              ? pathData.path
                              : getBoundaryBox([pathData])?.path;
      if(!pathBoundaryBox) return false;
      const points = getPointsFromPath(pathBoundaryBox);
      const d3Points = points.map((point) => [point.x, point.y] as [number, number]);
      return polygonContains(d3Points, [tapPoint.x, tapPoint.y]);
    }

  setMyPathData((prev) => {
    let newPathData = [...prev.pathData];
    newPathData = newPathData.reverse(); // reverse the path data to start from the latest
    // get current selected path index
    const activePathIndex = newPathData.findIndex(path => path.selected); // even if there are multiple active, we take first one as active
    // unselect all path
    newPathData.forEach((path) => { path.selected = false; }); // unselect  current active paths


    // If there is active bounding box and if tap is insded it, try to select next path
    if (activePathIndex !== -1 && activeBoundaryBoxPath && tappedInsidePathData(activeBoundaryBoxPath, true)) {
      for (let i = activePathIndex + 1; i < newPathData.length; i++) {
        if (tappedInsidePathData(newPathData[i])) {
          newPathData[i].selected = true;
          return { ...prev, pathData: newPathData.reverse() };
        }
      }
      for (let i = 0; i < activePathIndex; i++) {
        if (tappedInsidePathData(newPathData[i])) {
          newPathData[i].selected = true;
          return { ...prev, pathData: newPathData.reverse() };
        }
      }
    } else {// if outside current boundary box or no boundary box
      for (let i = 0; i < newPathData.length; i++) {
        if (tappedInsidePathData(newPathData[i]) && i !== activePathIndex) {
          newPathData[i].selected = true;
          return { ...prev, pathData: newPathData.reverse() };
        }
      }
    }

    // we gave priority to paths, lets see if we can select image instead
    // if (prev.imageData) {
    //   prev.imageData.forEach((image) => {
    //     if(image.selected) {
    //       image.selected = false;
    //       return;
    //     }
    //     // check if this one qualifies
    //     const imagePoints:PointType[] = [
    //       { x: image.x, y: image.y },
    //       { x: image.x + image.width, y: image.y },
    //       { x: image.x + image.width, y: image.y + image.height },
    //       { x: image.x, y: image.y + image.height },
    //     ];
    //     const d3Points = imagePoints.map((point) => [point.x, point.y] as [number, number]);
    //     if(polygonContains(d3Points, [tapPoint.x, tapPoint.y])) {
    //       image.selected = true; // will need improvement, it will do for now.
    //     }
    //   });
    //   return { ...prev, imageData: prev.imageData, pathData: newPathData.reverse() };
    // }

    // if no image data was checked, we will return the path data as usual
    return { ...prev, pathData: newPathData.reverse() };
  });
}
