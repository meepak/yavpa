import { PathDataType, SvgDataType } from "@u/types";
import { SetStateAction } from "react";
import { GestureStateChangeEvent, GestureUpdateEvent, TapGestureHandlerEventPayload } from "react-native-gesture-handler";
import { pathContainsPoint } from "@u/helper";

export const handleDoubleTapSelectEvent = (
  event: GestureStateChangeEvent<TapGestureHandlerEventPayload>,
  svgData: SvgDataType,
  selectedPaths: PathDataType[],
  setSelectedPaths: { (value: SetStateAction<PathDataType[]>): void; },
) => {
  const tapPoint = {
    x: event.x,
    y: event.y,
  }
  // const selectPathIfTapped = (pathData: PathDataType[], i: number) => {
  //   if (pathContainsPoint(pathData[i].path, tapPoint)) {
  //     return pathData[i];
  //   }
  //   return null;
  // }

  const isPathTapped = (path: PathDataType) => {  
    return pathContainsPoint(path.path, tapPoint);
  }


  // const activePathIndex = svgData.pathData.findIndex(path => selectedPaths.includes(path));
  // const startIndex = ((activePathIndex === -1) || (activePathIndex === 0))
  //   ? svgData.pathData.length - 1 : activePathIndex - 1;

  // for (let i = startIndex; i >= 0; i--) {
  //   const selectedPath = selectPathIfTapped(svgData.pathData, i);
  //   if (selectedPath) {
  //     console.log('From zIndex', i, 'selected path: ', selectedPath.guid);
  //     setSelectedPaths([{...selectedPath, zIndex: i}]);
  //     return;
  //   }
  // }


  // We don't want a new path out of current path in svgPath data, we want the one of the existing path to be dragged, not new one created
  // so lets just modify one of the svgPath data and not worry about not mutating objects
  svgData.pathData.forEach((path, i) => {
    if (isPathTapped(path) {
      console.log('From zIndex', i, 'selected path: ', path.guid);
      setSelectedPaths([path]);
      return;
    }
  });  

  // we got here means there is no selected path
  setSelectedPaths([]);

}