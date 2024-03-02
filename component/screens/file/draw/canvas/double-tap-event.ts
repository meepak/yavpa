import { PathDataType, SvgDataType } from "@u/types";
import { SetStateAction } from "react";
import { GestureUpdateEvent, TapGestureHandlerEventPayload } from "react-native-gesture-handler";
import { getPointsFromPath } from "@u/helper";
import * as polygon from 'd3-polygon';

export const doubleTapEvent = (
  event: GestureUpdateEvent<TapGestureHandlerEventPayload>,
  activeBoundaryBoxPath: PathDataType | null,
  setSvgData: { (value: SetStateAction<SvgDataType>): void; },
) => {
  const tapPoint = {
    x: event.x,
    y: event.y,
  }

  setSvgData((prev) => {
    let newPathData = [...prev.pathData];
    newPathData = newPathData.reverse(); // reverse the path data to start from the latest
    const activePathIndex = newPathData.findIndex(path => path.selected); // even if there are multiple active, we take first one as active
    newPathData.forEach((path) => { path.selected = false; }); // unselect  current active paths

    
    const pathContainsPoint = (path) => {
      const points = getPointsFromPath(path);
      const d3Points = points.map((point) => [point.x, point.y] as [number, number]);
      return polygon.polygonContains(d3Points, [tapPoint.x, tapPoint.y]);
    }
    
    const selectPathIfContainsPoint = (i: number) => {
      if (pathContainsPoint(newPathData[i].path)) {
        newPathData = newPathData.map((path, index) => ({
          ...path,
          selected: index === i,
        }));
        return true;
      }
      return false;
    }

    // If there is active bounding box and if tap is insded it, try to select next path
    if (activePathIndex !== -1 && activeBoundaryBoxPath && pathContainsPoint(activeBoundaryBoxPath.path)) {
      for (let i = activePathIndex + 1; i < newPathData.length; i++) {
        if (selectPathIfContainsPoint(i)) {
          return { ...prev, pathData: newPathData.reverse() };
        }
      }
      for (let i = 0; i < activePathIndex; i++) {
        if (selectPathIfContainsPoint(i)) {
          return { ...prev, pathData: newPathData.reverse() };
        }
      }
    } else {// if outside current boundary box or no boundary box
      for (let i = 0; i < newPathData.length; i++) {
        if (selectPathIfContainsPoint(i) && i !== activePathIndex) {
          return { ...prev, pathData: newPathData.reverse() };
        }
      }
    }

    return { ...prev, pathData: newPathData.reverse() };
  });
}