import { PathDataType, SvgDataType } from "@u/types";
import { SetStateAction } from "react";
import { GestureUpdateEvent, TapGestureHandlerEventPayload } from "react-native-gesture-handler";
import * as Crypto from "expo-crypto";
import { getPointsFromPath } from "@u/helper";
import * as polygon from 'd3-polygon';

export const doubleTapEvent = (
  event: GestureUpdateEvent<TapGestureHandlerEventPayload>,
  state: string,
  setSvgData: { (value: SetStateAction<SvgDataType>): void; },
  selectBoundaryBoxPath: PathDataType | null,
) => {

  console.log(state);
  
  const tapPoint = {
    x: event.x,
    y: event.y,
  }

  // CHeck if any which path has this point within them starting from latest top
  // Check if we tapped outside bounding box, deselect everything
  if (selectBoundaryBoxPath !== null) {
    const points = getPointsFromPath(selectBoundaryBoxPath.path);
    const d3Points = points.map((point) => [point.x, point.y] as [number, number]);
    if (!polygon.polygonContains(d3Points, [tapPoint.x, tapPoint.y])) {
      setSvgData((prev) => {
        const newPathData = prev.pathData.map((item) => {
          if (item.selected) {
            return {
              ...item,
              selected: false,
              guid: Crypto.randomUUID(),
            };
          } else {
            return item;
          }
        });
      
        console.log('outside exisitng bb, should trigger its deletion');
      
        return {
          ...prev,
          pathData: newPathData,
          metaData: {
            ...prev.metaData,
            updated_at: "",
          },
        };
      });
    }
  }
  // if there was no active bounding box, select the path and trigger its creation

  setSvgData((prev) => {
    const newPathData = prev.pathData.map((item) => {
      let itemPath = item.path[item.path.length - 1] !== "Z" ? item.path + "Z" : item.path;
      const points = getPointsFromPath(itemPath);
      const d3Points = points.map((point) => [point.x, point.y] as [number, number]);
  
      if (polygon.polygonContains(d3Points, [tapPoint.x, tapPoint.y])) {
        console.log('something selected, should trigger bbb creation');
        return {
          ...item,
          selected: true,
          guid: Crypto.randomUUID(),
        };
      } else if (item.selected) {
        console.log('impossible to come here, how??')
        return {
          ...item,
          selected: false,
          guid: Crypto.randomUUID(),
        };
      } else {
        return item;
      }
    });
  
    console.log('Number of selected paths', newPathData.filter((item) => item.selected).length);
  
    return {
      ...prev,
      pathData: newPathData,
      metaData: {
        ...prev.metaData,
        updated_at: "",
      },
    };
  });
}