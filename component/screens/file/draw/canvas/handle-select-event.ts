import { PathDataType, SvgDataType } from "@u/types";
import { SetStateAction } from "react";
import { GestureStateChangeEvent, GestureUpdateEvent, TapGestureHandlerEventPayload } from "react-native-gesture-handler";
import { getPointsFromPath } from "@u/helper";
import { polygonContains } from 'd3-polygon';

export const handleSelectEvent = (
  event: GestureStateChangeEvent<TapGestureHandlerEventPayload>,
  activeBoundaryBoxPath: PathDataType | null,
  setSvgData: { (value: SetStateAction<SvgDataType>): void; },
  pointers
) => {
  const tapPoint = {
    x: event.x,
    y: event.y,
  }

  if(pointers > 1) {
    // set all paths selected and return
    setSvgData((prev) => {
      let newPathData = [...prev.pathData];
      newPathData.forEach((path) => { path.selected = true; });
      return { ...prev, pathData: newPathData };
    });
    return;
  }

  setSvgData((prev) => {
    let newPathData = [...prev.pathData];
    newPathData = newPathData.reverse(); // reverse the path data to start from the latest
    // get current selected path index
    const activePathIndex = newPathData.findIndex(path => path.selected); // even if there are multiple active, we take first one as active
    // unselect all path
    newPathData.forEach((path) => { path.selected = false; }); // unselect  current active paths


    const pathContainsPoint = (path) => {
      const points = getPointsFromPath(path);
      const d3Points = points.map((point) => [point.x, point.y] as [number, number]);
      return polygonContains(d3Points, [tapPoint.x, tapPoint.y]);
    }

    const selectPathIfContainsPoint = (i: number) => {
      if (pathContainsPoint(newPathData[i].path)) {
        newPathData = newPathData.map((path, index) => ({
          ...path,
          selected: index === i,
        }));
        console.log('path selected');
        return true;
      }
      console.log('nothing selected');
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
